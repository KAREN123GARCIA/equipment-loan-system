import { BadRequestException, Injectable } from '@nestjs/common';
import { DeliveriesService } from '../deliveries/deliveries.service';
import { IncomingEvents } from './contracts';

@Injectable()
export class NotificationProcessor {
  constructor(private readonly deliveries: DeliveriesService) {}
  async handleIncomingEvent(event: IncomingEvents) {
    if (!event?.eventId || !event?.type || !event?.version) throw new BadRequestException('Invalid event format.');
    return this.deliveries.processEvent(event);
  }
}
