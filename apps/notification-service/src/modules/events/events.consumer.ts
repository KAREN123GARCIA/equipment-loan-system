import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../../shared/logger.service';

@Injectable()
export class EventsConsumer implements OnModuleInit {
  constructor(private readonly logger: LoggerService) {}
  onModuleInit() {
    this.logger.info({ msg: 'events_consumer_ready', brokerType: process.env.EVENTS_BROKER_TYPE || 'none' });
  }
}
