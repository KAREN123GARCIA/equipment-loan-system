import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { AppConfigService } from "../config/app-config.service";
import { EventEnvelope } from "./contracts";

@Injectable()
export class EventsPublisher {
  constructor(private readonly http: HttpService, private readonly cfg: AppConfigService) {}

  async publish<TType extends string, TPayload>(type: TType, topic: string, data: TPayload, correlationId?: string) {
    const envelope: EventEnvelope<TType, TPayload> = {
      specVersion: "1.0",
      type,
      version: "v1",
      id: randomUUID(),
      time: new Date().toISOString(),
      source: this.cfg.eventsSource(),
      correlationId,
      data,
    };

    const url = this.cfg.integrationEventsUrl();
    if (!url) return envelope;

    await firstValueFrom(this.http.post(url, { topic, envelope }, { timeout: this.cfg.httpTimeoutMs() }));
    return envelope;
  }
}
