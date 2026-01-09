import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEquipmentDto } from "./dto/create-equipment.dto";
import { ListEquipmentQuery } from "./dto/list-equipment.query";
import { UpdateEquipmentStatusDto } from "./dto/update-status.dto";
import { EquipmentStatus } from "@prisma/client";

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEquipmentDto) {
    try {
      return await this.prisma.equipment.create({
        data: {
          assetTag: dto.assetTag,
          name: dto.name,
          description: dto.description,
          category: dto.category,
          brand: dto.brand,
          model: dto.model,
          serialNumber: dto.serialNumber,
          status: dto.status ?? EquipmentStatus.AVAILABLE,
          location: dto.location,
          notes: dto.notes,
        },
      });
    } catch (e: any) {
      if (String(e?.code) === "P2002") {
        throw new BadRequestException("assetTag must be unique.");
      }
      throw e;
    }
  }

  async list(q: ListEquipmentQuery) {
    const skip = (q.page - 1) * q.limit;

    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.q) {
      where.OR = [
        { assetTag: { contains: q.q, mode: "insensitive" } },
        { name: { contains: q.q, mode: "insensitive" } },
        { category: { contains: q.q, mode: "insensitive" } },
        { brand: { contains: q.q, mode: "insensitive" } },
        { model: { contains: q.q, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.equipment.count({ where }),
      this.prisma.equipment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: q.limit,
      }),
    ]);

    return { page: q.page, limit: q.limit, total, items };
  }

  async getById(id: string) {
    const item = await this.prisma.equipment.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Equipment not found.");
    return item;
  }

  async updateStatus(id: string, dto: UpdateEquipmentStatusDto) {
    await this.getById(id);
    return this.prisma.equipment.update({ where: { id }, data: { status: dto.status } });
  }
}
