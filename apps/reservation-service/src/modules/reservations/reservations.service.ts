import { BadRequestException, ForbiddenException, HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { ReservationStatus } from "@prisma/client";
import { AppConfigService } from "../config/app-config.service";
import { ReservationsRepository } from "./reservations.repository";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { ListReservationsQuery } from "./dto/list-reservations.query";
import { UpdateReservationStatusDto } from "./dto/update-status.dto";
import { assertOwnOrPrivileged, isPrivileged } from "../authz/user.util";
import { EventsPublisher } from "../events/events.publisher";
import { Topics } from "../events/contracts";
import { MetricsService } from "../metrics/metrics.service";

type JwtUser = { sub: string; roles?: string[]; email?: string };
type InventoryEquipment = { id: string; status: "AVAILABLE" | "LOANED" | "MAINTENANCE" | "DAMAGED" };

@Injectable()
export class ReservationsService {
  constructor(
    private readonly repo: ReservationsRepository,
    private readonly cfg: AppConfigService,
    private readonly http: HttpService,
    private readonly events: EventsPublisher,
    private readonly metrics: MetricsService,
  ) {}

  async createReservation(user: JwtUser | undefined, dto: CreateReservationDto, authHeader?: string, correlationId?: string) {
    const userId = user?.sub;
    if (this.cfg.authRequired() && !userId) throw new ForbiddenException("Missing user (JWT).");

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) throw new BadRequestException("Invalid date format.");
    if (endAt <= startAt) throw new BadRequestException("endAt must be after startAt.");

    const equipment = await this.getEquipment(dto.equipmentId, authHeader);
    if (equipment.status !== "AVAILABLE") {
      this.metrics.reservationCreateTotal.inc({ result: "equipment_unavailable" });
      await this.events.publish("ReservationConflictDetected", Topics.ReservationConflictDetected, {
        equipmentId: dto.equipmentId, userId: userId ?? "anonymous", startAt: startAt.toISOString(), endAt: endAt.toISOString(), conflictingReservationIds: []
      }, correlationId);
      throw new BadRequestException(`Equipment is not available (status=${equipment.status}).`);
    }

    const conflicts = await this.repo.findConflicts(dto.equipmentId, startAt, endAt);
    if (conflicts.length) {
      this.metrics.reservationCreateTotal.inc({ result: "conflict" });
      await this.events.publish("ReservationConflictDetected", Topics.ReservationConflictDetected, {
        equipmentId: dto.equipmentId, userId: userId ?? "anonymous", startAt: startAt.toISOString(), endAt: endAt.toISOString(), conflictingReservationIds: conflicts.map(c=>c.id)
      }, correlationId);
      throw new BadRequestException("Reservation conflict: time window overlaps an existing reservation.");
    }

    const created = await this.repo.create({
      userId: userId ?? "anonymous",
      equipmentId: dto.equipmentId,
      startAt,
      endAt,
      status: ReservationStatus.ACTIVE,
      notes: dto.notes ?? null,
    });

    this.metrics.reservationCreateTotal.inc({ result: "ok" });

    await this.events.publish("ReservationCreated", Topics.ReservationCreated, {
      reservationId: created.id, userId: created.userId, equipmentId: created.equipmentId, startAt: created.startAt.toISOString(), endAt: created.endAt.toISOString()
    }, correlationId);

    return created;
  }

  async listReservations(user: JwtUser | undefined, q: ListReservationsQuery) {
    const roles = user?.roles ?? [];
    const uid = user?.sub;

    if (this.cfg.authRequired() && !isPrivileged(roles)) {
      if (!uid) throw new ForbiddenException("Missing user.");
      if (q.userId && q.userId !== uid) throw new ForbiddenException("Cannot query other users.");
      q.userId = uid;
    }

    const where: any = {};
    if (q.userId) where.userId = q.userId;
    if (q.equipmentId) where.equipmentId = q.equipmentId;
    if (q.status) where.status = q.status;

    if (q.from || q.to) {
      const from = q.from ? new Date(q.from) : undefined;
      const to = q.to ? new Date(q.to) : undefined;
      where.AND = [];
      if (from) where.AND.push({ endAt: { gte: from } });
      if (to) where.AND.push({ startAt: { lte: to } });
    }

    return this.repo.list(where);
  }

  async getReservation(user: JwtUser | undefined, id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException("Reservation not found.");
    if (this.cfg.authRequired()) {
      const uid = user?.sub;
      if (!uid) throw new ForbiddenException("Missing user.");
      assertOwnOrPrivileged(uid, r.userId, user?.roles);
    }
    return r;
  }

  async cancelReservation(user: JwtUser | undefined, id: string, _authHeader?: string, correlationId?: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException("Reservation not found.");
    if (r.status !== ReservationStatus.ACTIVE) throw new BadRequestException("Reservation is not active.");

    if (this.cfg.authRequired()) {
      const uid = user?.sub;
      if (!uid) throw new ForbiddenException("Missing user.");
      assertOwnOrPrivileged(uid, r.userId, user?.roles);
    }

    const updated = await this.repo.update(id, { status: ReservationStatus.CANCELLED });
    this.metrics.reservationCancelTotal.inc({ result: "ok" });

    await this.events.publish("ReservationCancelled", Topics.ReservationCancelled, {
      reservationId: updated.id, userId: updated.userId, equipmentId: updated.equipmentId, reason: "user_cancelled"
    }, correlationId);

    return updated;
  }

  async adminUpdateStatus(_user: JwtUser | undefined, id: string, dto: UpdateReservationStatusDto, _authHeader?: string, correlationId?: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException("Reservation not found.");

    const updated = await this.repo.update(id, { status: dto.status as any });

    if (dto.status === "CANCELLED") {
      this.metrics.reservationCancelTotal.inc({ result: "admin" });
      await this.events.publish("ReservationCancelled", Topics.ReservationCancelled, {
        reservationId: updated.id, userId: updated.userId, equipmentId: updated.equipmentId, reason: dto.reason ?? "admin_cancelled"
      }, correlationId);
    }
    if (dto.status === "EXPIRED") {
      this.metrics.reservationExpireTotal.inc();
      await this.events.publish("ReservationExpired", Topics.ReservationExpired, {
        reservationId: updated.id, userId: updated.userId, equipmentId: updated.equipmentId
      }, correlationId);
    }

    return updated;
  }

  private async getEquipment(equipmentId: string, authHeader?: string): Promise<InventoryEquipment> {
    const url = `${this.cfg.inventoryServiceUrl()}/equipment/${equipmentId}`;
    try {
      const res = await firstValueFrom(this.http.get(url, {
        timeout: this.cfg.httpTimeoutMs(),
        headers: this.cfg.authRequired() && authHeader ? { Authorization: authHeader } : undefined,
      }));
      return res.data as InventoryEquipment;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) throw new NotFoundException("Equipment not found (inventory-service).");
      throw new HttpException({ message:"Failed to validate equipment with inventory-service.", details: this.safeErr(err) }, 502);
    }
  }

  private safeErr(err: any) { return { message: err?.message, status: err?.response?.status, data: err?.response?.data }; }
}
