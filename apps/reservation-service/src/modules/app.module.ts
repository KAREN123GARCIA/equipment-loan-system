import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/app-config.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthzModule } from "./authz/authz.module";
import { EventsModule } from "./events/events.module";
import { ReservationsModule } from "./reservations/reservations.module";
import { HealthModule } from "./health/health.module";
import { MetricsModule } from "./metrics/metrics.module";

@Module({
  imports: [AppConfigModule, PrismaModule, AuthzModule, EventsModule, ReservationsModule, HealthModule, MetricsModule],
})
export class AppModule {}
