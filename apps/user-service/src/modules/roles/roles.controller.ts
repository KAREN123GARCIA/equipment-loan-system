import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtOptionalGuard } from "../auth/jwt-optional.guard";
import { RolesService } from "./roles.service";

@ApiTags("roles")
@Controller("roles")
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @ApiOperation({ summary: "List all available roles" })
  @ApiBearerAuth()
  @UseGuards(JwtOptionalGuard)
  async list() {
    return { items: await this.roles.list() };
  }
}
