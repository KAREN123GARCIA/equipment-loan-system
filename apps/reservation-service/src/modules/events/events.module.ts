import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AppConfigModule } from "../config/app-config.module";
import { EventsPublisher } from "./events.publisher";
import { EventsConsumerController } from "./events.consumer.controller";

@Module({
  imports: [HttpModule, AppConfigModule],
  providers: [EventsPublisher],
  controllers: [EventsConsumerController],
  exports: [EventsPublisher],
})
export class EventsModule {}
