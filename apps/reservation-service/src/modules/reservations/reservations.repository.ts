import { Injectable } from "@nestjs/common";
import { Prisma, ReservationStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(data: Prisma.ReservationCreateInput) { return this.prisma.reservation.create({ data }); }
  findById(id: string) { return this.prisma.reservation.findUnique({ where: { id } }); }
  list(where: Prisma.ReservationWhereInput) { return this.prisma.reservation.findMany({ where, orderBy:{ createdAt:"desc" } }); }

  findConflicts(equipmentId: string, startAt: Date, endAt: Date) {
    return this.prisma.reservation.findMany({
      where: { equipmentId, status:{ in:[ReservationStatus.ACTIVE] }, AND:[{ startAt:{ lt:endAt } }, { endAt:{ gt:startAt } }] },
      select: { id:true }
    });
  }

  update(id: string, data: Prisma.ReservationUpdateInput) { return this.prisma.reservation.update({ where:{ id }, data }); }

  expireBatch(cutoff: Date) {
    return this.prisma.reservation.updateMany({ where:{ status:ReservationStatus.ACTIVE, createdAt:{ lt:cutoff } }, data:{ status:ReservationStatus.EXPIRED } });
  }

  listExpiredSince(since: Date) {
    return this.prisma.reservation.findMany({ where:{ status:ReservationStatus.EXPIRED, updatedAt:{ gte: since } }, select:{ id:true, userId:true, equipmentId:true } });
  }
}
