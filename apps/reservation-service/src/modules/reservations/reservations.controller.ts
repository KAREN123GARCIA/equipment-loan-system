import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtOptionalGuard } from "../authz/jwt-optional.guard";
import { RolesGuard } from "../authz/roles.guard";
import { Roles } from "../authz/roles.decorator";
import { ReservationsService } from "./reservations.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { ListReservationsQuery } from "./dto/list-reservations.query";
import { UpdateReservationStatusDto } from "./dto/update-status.dto";

@ApiTags("reservations")
@ApiBearerAuth()
@Controller("reservations")
@UseGuards(JwtOptionalGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly svc: ReservationsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateReservationDto) {
    return this.svc.createReservation(req.user, dto, req.headers.authorization, req.headers["x-correlation-id"]);
  }

  @Get()
  list(@Req() req: any, @Query() q: ListReservationsQuery) {
    return this.svc.listReservations(req.user, q);
  }

  @Get(":id")
  getById(@Req() req: any, @Param("id") id: string) {
    return this.svc.getReservation(req.user, id);
  }

  @Delete(":id")
  cancel(@Req() req: any, @Param("id") id: string) {
    return this.svc.cancelReservation(req.user, id, req.headers.authorization, req.headers["x-correlation-id"]);
  }

  @Patch(":id/status")
  @Roles("ADMIN", "TECH")
  setStatus(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateReservationStatusDto) {
    return this.svc.adminUpdateStatus(req.user, id, dto, req.headers.authorization, req.headers["x-correlation-id"]);
  }
}
