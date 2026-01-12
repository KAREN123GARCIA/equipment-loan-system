import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new client.Registry();

  readonly httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [this.registry],
  });

  readonly emailsSentTotal = new client.Counter({
    name: 'emails_sent_total',
    help: 'Total number of emails sent',
    registers: [this.registry],
  });

  readonly emailsFailedTotal = new client.Counter({
    name: 'emails_failed_total',
    help: 'Total number of email send failures',
    registers: [this.registry],
  });

  readonly deliveriesRetriedTotal = new client.Counter({
    name: 'deliveries_retried_total',
    help: 'Total number of delivery retries scheduled',
    registers: [this.registry],
  });

  constructor() {
    this.registry.setDefaultLabels({ service: 'notification-service' });
    client.collectDefaultMetrics({ register: this.registry });
  }

  async metrics(): Promise<string> {
    return this.registry.metrics();
  }
}
