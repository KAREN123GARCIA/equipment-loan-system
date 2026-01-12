import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { EquipmentStatusUpdatedPayload, Topics } from "./contracts";

@ApiTags("events")
@Controller("events")
export class EventsConsumerController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("inventory")
  @HttpCode(202)
  async onInventoryEvent(@Body() body: { topic: string; envelope: { data: EquipmentStatusUpdatedPayload } }) {
    if (body?.topic !== Topics.EquipmentStatusUpdated) return { accepted: false };
    const data = body.envelope.data;
    await this.prisma.equipmentState.upsert({
      where: { equipmentId: data.equipmentId },
      update: { status: data.status },
      create: { equipmentId: data.equipmentId, status: data.status },
    });
    return { accepted: true };
  }
}
