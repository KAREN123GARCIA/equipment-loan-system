import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../../shared/logger.service';
import { BaseEvent, Topics } from './contracts';

@Injectable()
export class EventsPublisher {
  constructor(private readonly http: HttpService, private readonly logger: LoggerService) {}

  async publish(event: BaseEvent<any>) {
    const url = process.env.INTEGRATION_SERVICE_EVENTS_URL;
    if (!url) {
      this.logger.warn('INTEGRATION_SERVICE_EVENTS_URL not set; skipping publish');
      return;
    }
    const payload = { source: process.env.EVENTS_SOURCE || 'notification-service', topic: Topics.Notifications, event };
    try {
      await firstValueFrom(this.http.post(url, payload, { timeout: 5000 }));
    } catch (err: any) {
      this.logger.error('failed_to_publish_event', { msg: err?.message });
    }
  }
}
