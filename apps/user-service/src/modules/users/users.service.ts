import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

type ListArgs = {
  page: number;
  limit: number;
  q?: string;
  status?: "ACTIVE" | "DISABLED";
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: "ACTIVE",
      },
    });
  }

  async list(args: ListArgs) {
    const page = args.page ?? 1;
    const limit = args.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (args.status) where.status = args.status;

    if (args.q) {
      where.OR = [
        { username: { contains: args.q, mode: "insensitive" } },
        { email: { contains: args.q, mode: "insensitive" } },
        { firstName: { contains: args.q, mode: "insensitive" } },
        { lastName: { contains: args.q, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { total, items };
  }

  async getById(id: string) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException("User not found.");
    return u;
  }

  async getByEmail(email: string) {
    if (!email) throw new BadRequestException("Missing email.");
    const u = await this.prisma.user.findUnique({ where: { email } });
    if (!u) throw new NotFoundException("User not found.");
    return u;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.getById(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        username: dto.username ?? undefined,
        email: dto.email ?? undefined,
        firstName: dto.firstName ?? undefined,
        lastName: dto.lastName ?? undefined,
      },
    });
  }


  async disable(id: string) {
    await this.getById(id);
    return this.prisma.user.update({
      where: { id },
      data: { status: "DISABLED" },
    });
  }

async getRoles(id: string) {
  const u = await this.prisma.user.findUnique({
    where: { id },
    include: { roles: { include: { role: true } } },
  });

  if (!u) throw new NotFoundException("User not found.");
  return u.roles.map((ur) => ur.role.name);
}



async setRoles(userId: string, roles: string[]) {
  await this.getById(userId);

  return this.prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        deleteMany: {}, 
        create: roles.map((r) => ({
          role: {
            connect: { name: r }, 
          },
        })),
      },
    },
    include: { roles: { include: { role: true } } },
  });
}


}
