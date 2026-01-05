import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PaginatedUsersDto } from "./dto/paginated-users.dto";
import { JwtOptionalGuard } from "../auth/jwt-optional.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { Public } from "../auth/public.decorator";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // ✅ OPCIÓN A: endpoint público (sin token)
  @Post()
  @Public()
  @ApiOperation({ summary: "Create a new user (public registration)" })
  async create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List users (paginated)" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "q", required: false, example: "john" })
  @ApiQuery({ name: "status", required: false, example: "ACTIVE" })
  @ApiBearerAuth()
  @UseGuards(JwtOptionalGuard)
  async list(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("q") q?: string,
    @Query("status") status?: "ACTIVE" | "DISABLED",
  ): Promise<PaginatedUsersDto> {
    const { total, items } = await this.users.list({ page, limit, q, status });
    return {
      page,
      limit,
      total,
      items: items.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        status: u.status,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })),
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by id" })
  @ApiBearerAuth()
  @UseGuards(JwtOptionalGuard)
  async get(@Param("id") id: string) {
    const u = await this.users.getById(id);
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user (partial)" })
  @ApiBearerAuth()
  @UseGuards(JwtOptionalGuard, RolesGuard)
  @Roles("ADMIN")
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    const u = await this.users.update(id, dto);
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-disable user (status=DISABLED)" })
  @ApiBearerAuth()
  @UseGuards(JwtOptionalGuard, RolesGuard)
  @Roles("ADMIN")
  async disable(@Param("id") id: string) {
    const u = await this.users.disable(id);
    return { id: u.id, status: u.status };
  }

  @Get(":id/roles")
  @ApiOperation({ summary: "Get roles assigned to a user" })
  @ApiBearerAuth()
  @UseGuards(JwtOptionalGuard)
  async getRoles(@Param("id") id: string) {
    return { userId: id, roles: await this.users.getRoles(id) };
  }

  @Post(":id/roles")
  @ApiOperation({ summary: "Set roles for a user (replaces existing roles)" })
  @ApiBearerAuth()
  @UseGuards(JwtOptionalGuard, RolesGuard)
  @Roles("ADMIN")
  async setRoles(@Param("id") id: string, @Body() body: { roles: string[] }) {
    return { userId: id, roles: await this.users.setRoles(id, body.roles ?? []) };
  }
}
