import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ScheduleModule } from "@nestjs/schedule";
import { ReservationsController } from "./reservations.controller";
import { ReservationsService } from "./reservations.service";
import { ReservationsRepository } from "./reservations.repository";
import { ReservationsExpirationJob } from "./reservations.expiration.job";
import { AuthzModule } from "../authz/authz.module";
import { EventsModule } from "../events/events.module";
import { AppConfigModule } from "../config/app-config.module";
import { MetricsModule } from "../metrics/metrics.module";

@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), AuthzModule, EventsModule, AppConfigModule, MetricsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository, ReservationsExpirationJob],
})
export class ReservationsModule {}
