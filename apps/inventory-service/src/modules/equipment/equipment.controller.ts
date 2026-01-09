import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { EquipmentService } from "./equipment.service";
import { CreateEquipmentDto } from "./dto/create-equipment.dto";
import { ListEquipmentQuery } from "./dto/list-equipment.query";
import { UpdateEquipmentStatusDto } from "./dto/update-status.dto";
import { Roles } from "../authz/roles.decorator";

@Controller("equipment")
export class EquipmentController {
  constructor(private readonly service: EquipmentService) {}

  @Post()
  @Roles("ADMIN", "TECH")
  create(@Body() dto: CreateEquipmentDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() q: ListEquipmentQuery) {
    return this.service.list(q);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.getById(id);
  }

  @Patch(":id/status")
  @Roles("ADMIN", "TECH")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto);
  }
}

type UpdateStatusDto = UpdateEquipmentStatusDto;
