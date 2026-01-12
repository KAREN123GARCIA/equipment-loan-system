import { Injectable, OnModuleInit } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { LoggerService } from '../../shared/logger.service';

@Injectable()
export class RetryWorker implements OnModuleInit {
  constructor(private readonly deliveries: DeliveriesService, private readonly logger: LoggerService) {}

  onModuleInit() {
    setInterval(async () => {
      try {
        const r = await this.deliveries.processDueRetries();
        if (r.processed > 0) this.logger.info({ msg: 'retry_worker_processed', ...r });
      } catch (e: any) {
        this.logger.error('retry_worker_failed', { msg: e?.message });
      }
    }, 10000);
  }
}
