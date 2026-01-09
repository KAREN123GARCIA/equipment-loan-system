import { HttpException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLoanDto } from "./dto/create-loan.dto";
import { ReturnLoanDto } from "./dto/return-loan.dto";
import { AppConfigService } from "../config/app-config.service";
import { HttpService } from "@nestjs/axios";
import { LoanStatus } from "@prisma/client";

type JwtUser = { sub: string; roles?: string[]; email?: string };

type InventoryEquipment = {
  id: string;
  status: "AVAILABLE" | "LOANED" | "MAINTENANCE" | "DAMAGED";
};

@Injectable()
export class LoansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cfg: AppConfigService,
    private readonly http: HttpService,
  ) {}

  async listAllLoans() {
    return this.prisma.loan.findMany({ orderBy: { createdAt: "desc" } });
  }

  async listLoansByUser(userId: string) {
    if (!userId) throw new BadRequestException("Missing user id (sub).");
    return this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getLoanById(id: string) {
    const loan = await this.prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundException("Loan not found.");
    return loan;
  }

  async createLoan(user: JwtUser, dto: CreateLoanDto, authHeader?: string) {
    const effectiveUserId = dto.userId ?? user?.sub;
    if (!effectiveUserId) throw new BadRequestException("Missing user id.");

    const authorization = this.forwardAuth(authHeader);

    await this.assertUserExists(effectiveUserId, authorization);

    const equipment = await this.getEquipment(dto.equipmentId, authorization);
    if (!equipment) throw new NotFoundException("Equipment not found.");
    if (equipment.status !== "AVAILABLE") {
      throw new BadRequestException(`Equipment is not available (status=${equipment.status}).`);
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : null;

    const created = await this.prisma.loan.create({
      data: {
        userId: effectiveUserId,
        equipmentId: dto.equipmentId,
        status: LoanStatus.ACTIVE,
        startDate,
        dueDate,
        notes: dto.notes ?? null,
      },
    });

    try {
      await this.updateEquipmentStatus(dto.equipmentId, "LOANED", authorization);
    } catch (err: any) {
      await this.prisma.loan.delete({ where: { id: created.id } }).catch(() => undefined);
      throw new HttpException(
        {
          message: "Failed to lock equipment in inventory-service. Loan was rolled back.",
          details: this.safeErr(err),
        },
        502,
      );
    }

    return created;
  }

  async returnLoan(_user: JwtUser, loanId: string, dto: ReturnLoanDto, authHeader?: string) {
    const authorization = this.forwardAuth(authHeader);

    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new NotFoundException("Loan not found.");
    if (loan.status !== LoanStatus.ACTIVE) throw new BadRequestException("Loan is not active.");

    try {
      await this.updateEquipmentStatus(loan.equipmentId, "AVAILABLE", authorization);
    } catch (err: any) {
      throw new HttpException(
        {
          message: "Failed to update equipment status in inventory-service. Loan not closed.",
          details: this.safeErr(err),
        },
        502,
      );
    }

    return this.prisma.loan.update({
      where: { id: loanId },
      data: {
        status: LoanStatus.RETURNED,
        returnedAt: new Date(),
        notes: dto.notes ?? loan.notes,
      },
    });
  }

  private forwardAuth(authHeader?: string): string | undefined {
    if (!this.cfg.authRequired()) return undefined;
    if (!authHeader) throw new BadRequestException("Missing Authorization header.");
    return authHeader;
  }

  private async assertUserExists(userId: string, authorization?: string) {
    const url = `${this.cfg.usersServiceUrl()}/users/${userId}`;
    try {
      await firstValueFrom(
        this.http.get(url, {
          headers: authorization ? { Authorization: authorization } : undefined,
        }),
      );
    } catch (err: any) {
      throw new HttpException(
        { message: "User validation failed (users-service).", details: this.safeErr(err) },
        502,
      );
    }
  }

  private async getEquipment(equipmentId: string, authorization?: string): Promise<InventoryEquipment> {
    const url = `${this.cfg.inventoryServiceUrl()}/equipment/${equipmentId}`;
    try {
      const res = await firstValueFrom(
        this.http.get(url, {
          headers: authorization ? { Authorization: authorization } : undefined,
        }),
      );
      return res.data as InventoryEquipment;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) throw new NotFoundException("Equipment not found.");
      throw new HttpException(
        { message: "Failed to fetch equipment (inventory-service).", details: this.safeErr(err) },
        502,
      );
    }
  }

  private async updateEquipmentStatus(
    equipmentId: string,
    status: "AVAILABLE" | "LOANED" | "MAINTENANCE" | "DAMAGED",
    authorization?: string,
  ) {
    const url = `${this.cfg.inventoryServiceUrl()}/equipment/${equipmentId}/status`;
    await firstValueFrom(
      this.http.patch(
        url,
        { status },
        {
          headers: authorization ? { Authorization: authorization } : undefined,
        },
      ),
    );
  }

  private safeErr(err: any) {
    return {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    };
  }
}
