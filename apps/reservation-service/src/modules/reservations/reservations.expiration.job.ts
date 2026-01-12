import { Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { AppConfigService } from "../config/app-config.service";
import { ReservationsRepository } from "./reservations.repository";
import { EventsPublisher } from "../events/events.publisher";
import { Topics } from "../events/contracts";
import { MetricsService } from "../metrics/metrics.service";

@Injectable()
export class ReservationsExpirationJob {
  private lastEmitWindow = new Date(0);

  constructor(
    private readonly cfg: AppConfigService,
    private readonly repo: ReservationsRepository,
    private readonly events: EventsPublisher,
    private readonly metrics: MetricsService,
  ) {}

  @Interval("reservation-expiration-scan", 30_000)
  async scan() {
    const cutoff = new Date(Date.now() - this.cfg.holdTtlMinutes() * 60_000);
    const result = await this.repo.expireBatch(cutoff);

    if (result.count > 0) {
      this.metrics.reservationExpireTotal.inc(result.count);

      const since = this.lastEmitWindow;
      this.lastEmitWindow = new Date();

      const expired = await this.repo.listExpiredSince(since);
      for (const r of expired) {
        await this.events.publish("ReservationExpired", Topics.ReservationExpired, { reservationId: r.id, userId: r.userId, equipmentId: r.equipmentId });
      }
    }
  }
}
