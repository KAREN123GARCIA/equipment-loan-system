import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DevEventsController } from './dev-events.controller';
import { NotificationProcessor } from './notification.processor';
import { EventsConsumer } from './events.consumer';
import { EventsPublisher } from './events.publisher';
import { DeliveriesModule } from '../deliveries/deliveries.module';

@Module({
  imports: [HttpModule, DeliveriesModule],
  controllers: [DevEventsController],
  providers: [NotificationProcessor, EventsConsumer, EventsPublisher],
  exports: [EventsPublisher],
})
export class EventsModule {}
