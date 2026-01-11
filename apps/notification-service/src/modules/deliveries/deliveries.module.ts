import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Delivery, DeliverySchema } from './delivery.schema';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesRepository } from './deliveries.repository';
import { TemplatesModule } from '../templates/templates.module';
import { MetricsModule } from '../metrics/metrics.module';
import { EventsModule } from '../events/events.module';
import { RetryWorker } from './retry.worker';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Delivery.name, schema: DeliverySchema }]),
    TemplatesModule,
    MetricsModule,
    EventsModule,
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService, DeliveriesRepository, RetryWorker],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
