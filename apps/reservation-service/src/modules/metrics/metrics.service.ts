import { Injectable } from "@nestjs/common";
import * as client from "prom-client";

@Injectable()
export class MetricsService {
  readonly registry = new client.Registry();

  readonly reservationCreateTotal = new client.Counter({
    name: "reservation_create_total",
    help: "Total reservations created",
    labelNames: ["result"] as const,
    registers: [this.registry],
  });

  readonly reservationCancelTotal = new client.Counter({
    name: "reservation_cancel_total",
    help: "Total reservations cancelled",
    labelNames: ["result"] as const,
    registers: [this.registry],
  });

  readonly reservationExpireTotal = new client.Counter({
    name: "reservation_expire_total",
    help: "Total reservations expired",
    registers: [this.registry],
  });

  constructor() {
    client.collectDefaultMetrics({ register: this.registry });
  }

  metricsText() {
    return this.registry.metrics();
  }
}
