import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/app-config.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthzModule } from "./authz/authz.module";
import { EquipmentModule } from "./equipment/equipment.module";

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuthzModule,
    EquipmentModule,
  ],
})
export class AppModule {}
