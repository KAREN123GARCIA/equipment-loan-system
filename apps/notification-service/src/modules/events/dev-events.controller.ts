import { Body, Controller, ForbiddenException, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationProcessor } from './notification.processor';
import { IncomingEvents } from './contracts';

@ApiTags('dev')
@Controller('dev/events')
export class DevEventsController {
  constructor(private readonly processor: NotificationProcessor) {}

  @Post()
  async ingest(@Req() req: any, @Body() event: IncomingEvents) {
    if (String(process.env.ENABLE_DEV_EVENTS || 'false') !== 'true') throw new ForbiddenException('Dev event ingestion disabled.');
    const token = req.headers['x-dev-token'];
    if (!token || token !== process.env.DEV_EVENTS_TOKEN) throw new ForbiddenException('Invalid dev token.');
    return this.processor.handleIncomingEvent(event);
  }
}
