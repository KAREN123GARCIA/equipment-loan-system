import { Module } from "@nestjs/common";
import { EquipmentController } from "./equipment.controller";
import { EquipmentService } from "./equipment.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthzModule } from "../authz/authz.module"; 

@Module({
  imports: [PrismaModule, AuthzModule], 
  controllers: [EquipmentController],
  providers: [EquipmentService],
})
export class EquipmentModule {}
