import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          username: dto.username,
          email: dto.email.toLowerCase(),
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });
    } catch (e: any) {
      // Prisma unique constraint
      if (e?.code === "P2002") {
        throw new BadRequestException(`Unique constraint violation: ${e?.meta?.target ?? "field"}`);
      }
      throw e;
    }
  }

  async list(params: { page: number; limit: number; q?: string; status?: "ACTIVE" | "DISABLED" }) {
    const { page, limit, q, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (q && q.trim() !== "") {
      const contains = q.trim();
      where.OR = [
        { username: { contains, mode: "insensitive" } },
        { email: { contains, mode: "insensitive" } },
        { firstName: { contains, mode: "insensitive" } },
        { lastName: { contains, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    ]);

    return { total, items, page, limit };
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found.");
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.getById(id);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          username: dto.username,
          email: dto.email?.toLowerCase(),
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });
    } catch (e: any) {
      if (e?.code === "P2002") {
        throw new BadRequestException(`Unique constraint violation: ${e?.meta?.target ?? "field"}`);
      }
      throw e;
    }
  }

  async disable(id: string) {
    await this.getById(id);
    return this.prisma.user.update({ where: { id }, data: { status: "DISABLED" } });
  }

  async getRoles(id: string) {
    await this.getById(id);
    const rows = await this.prisma.userRole.findMany({
      where: { userId: id },
      include: { role: true },
    });
    return rows.map((r) => r.role.name);
  }

  async setRoles(id: string, roles: string[]) {
    await this.getById(id);

    const normalized = [...new Set(roles.map((r) => r.toUpperCase().trim()).filter(Boolean))];
    if (normalized.length === 0) throw new BadRequestException("roles must not be empty.");

    const roleEntities = await this.prisma.role.findMany({
      where: { name: { in: normalized } },
    });

    if (roleEntities.length !== normalized.length) {
      const found = new Set(roleEntities.map((r) => r.name));
      const missing = normalized.filter((r) => !found.has(r));
      throw new BadRequestException(`Unknown roles: ${missing.join(", ")}`);
    }

    await this.prisma.userRole.deleteMany({ where: { userId: id } });

    await this.prisma.userRole.createMany({
      data: roleEntities.map((r) => ({ userId: id, roleId: r.id })),
    });

    return normalized;
  }
}
