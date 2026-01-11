import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveriesRepository } from './deliveries.repository';
import { TemplatesRepository } from '../templates/templates.repository';
import { TemplateEngine } from '../../shared/template-engine';
import { MailerService } from '../../shared/mailer.service';
import { LoggerService } from '../../shared/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { EventsPublisher } from '../events/events.publisher';
import { BaseEvent, IncomingEvents, OutgoingEventTypes } from '../events/contracts';

type JwtUser = { sub: string; roles?: string[]; email?: string };

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly repo: DeliveriesRepository,
    private readonly templatesRepo: TemplatesRepository,
    private readonly engine: TemplateEngine,
    private readonly mailer: MailerService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly publisher: EventsPublisher,
  ) {}

  async listForUser(requestUser: JwtUser | null, userIdQuery?: string) {
    const roles = requestUser?.roles || [];
    const isAdmin = roles.includes('ADMIN') || roles.includes('TECHNICIAN');

    const filter: any = {};
    if (userIdQuery === 'me') {
      if (!requestUser?.sub) throw new BadRequestException('Missing user identity.');
      filter.userId = requestUser.sub;
    } else if (userIdQuery) {
      if (!isAdmin) throw new ForbiddenException('Only admin/technician can query other users.');
      filter.userId = userIdQuery;
    } else {
      if (!isAdmin) throw new ForbiddenException('userId=me required for non-admin.');
    }
    return this.repo.list(filter);
  }

  async get(id: string) {
    const d = await this.repo.findById(id);
    if (!d) throw new NotFoundException('Delivery not found.');
    return d;
  }

  async processEvent(event: IncomingEvents) {
    const existing = await this.repo.findByEventId(event.eventId);
    if (existing) {
      this.logger.info({ msg: 'idempotent_event_skip', eventId: event.eventId, deliveryId: (existing as any)._id });
      return existing;
    }

    const channel: 'email' | 'inapp' = 'email';
    const templateKey = `${event.type}.email`;
    const vars: any = event.data;

    const template = await this.templatesRepo.findByKey(templateKey);
    if (!template || !template.enabled) {
      const created: any = await this.repo.create({
        eventId: event.eventId,
        eventType: event.type,
        userId: vars.userId,
        userEmail: vars.userEmail,
        channel,
        templateKey,
        status: 'FAILED',
        attempts: 0,
        lastError: 'Template not found or disabled',
        correlationId: event.correlationId,
      });
      await this.publishFailed(String(created._id), event, 'Template not found or disabled');
      return created;
    }

    const subject = this.engine.render(template.subject, vars);
    const body = this.engine.render(template.body, vars);

    let delivery: any;
    try {
      delivery = await this.repo.create({
        eventId: event.eventId,
        eventType: event.type,
        userId: vars.userId,
        userEmail: vars.userEmail,
        channel,
        templateKey,
        subject,
        body,
        status: 'PENDING',
        attempts: 0,
        correlationId: event.correlationId,
        nextAttemptAt: new Date(),
      });
    } catch (e: any) {
      const again = await this.repo.findByEventId(event.eventId);
      if (again) return again;
      throw e;
    }

    await this.trySendDelivery(String(delivery._id), event);
    return this.repo.findById(String(delivery._id));
  }

  async resend(deliveryId: string, actor: JwtUser) {
    const roles = actor?.roles || [];
    const isAdmin = roles.includes('ADMIN') || roles.includes('TECHNICIAN');
    if (!isAdmin) throw new ForbiddenException('Only admin/technician can resend.');

    const d = await this.repo.findById(deliveryId);
    if (!d) throw new NotFoundException('Delivery not found.');

    await this.repo.update(deliveryId, { status: 'PENDING', lastError: undefined, nextAttemptAt: new Date() });
    await this.trySendStoredDelivery(deliveryId);
    return this.repo.findById(deliveryId);
  }

  async processDueRetries() {
    const due = await this.repo.findDueRetries(new Date());
    for (const d of due) await this.trySendStoredDelivery(String((d as any)._id));
    return { processed: due.length };
  }

  private computeBackoffMs(attempt: number) {
    const initial = Number(process.env.DELIVERY_INITIAL_BACKOFF_MS || 2000);
    const max = Number(process.env.DELIVERY_MAX_BACKOFF_MS || 60000);
    const ms = Math.min(max, initial * Math.pow(2, Math.max(0, attempt - 1)));
    const jitter = Math.floor(ms * (Math.random() * 0.2));
    return ms + jitter;
  }

  private maxAttempts() { return Number(process.env.DELIVERY_MAX_ATTEMPTS || 5); }

  private async trySendDelivery(deliveryId: string, event: IncomingEvents) {
    const d: any = await this.repo.findById(deliveryId);
    if (!d) return;

    try {
      await this.performSend(d);
      await this.repo.update(deliveryId, { status: 'SENT', sentAt: new Date(), nextAttemptAt: undefined });
      this.metrics.emailsSentTotal.inc();
      await this.publishSent(deliveryId, event);
    } catch (err: any) {
      const updated: any = await this.handleFailure(deliveryId, d, err);
      await this.publishFailed(deliveryId, event, updated?.lastError || 'send failed');
    }
  }

  private async trySendStoredDelivery(deliveryId: string) {
    const d: any = await this.repo.findById(deliveryId);
    if (!d) return;

    try {
      await this.performSend(d);
      await this.repo.update(deliveryId, { status: 'SENT', sentAt: new Date(), nextAttemptAt: undefined });
      this.metrics.emailsSentTotal.inc();
      await this.publisher.publish(this.outgoingEvent(OutgoingEventTypes.NotificationSent, {
        deliveryId,
        eventId: d.eventId,
        eventType: d.eventType,
        userId: d.userId,
        channel: d.channel,
        status: 'SENT',
      }));
    } catch (err: any) {
      const updated: any = await this.handleFailure(deliveryId, d, err);
      await this.publisher.publish(this.outgoingEvent(OutgoingEventTypes.NotificationFailed, {
        deliveryId,
        eventId: d.eventId,
        eventType: d.eventType,
        userId: d.userId,
        channel: d.channel,
        status: 'FAILED',
        reason: updated?.lastError,
      }));
    }
  }

  private async performSend(delivery: any) {
    if (delivery.channel === 'inapp') return;
    const to = delivery.userEmail;
    if (!to) throw new BadRequestException('Missing userEmail for email delivery.');
    await this.mailer.sendEmail({ to, subject: delivery.subject || '(no subject)', html: delivery.body || '' });
    this.logger.info({ msg: 'email_sent', deliveryId: String(delivery._id), to });
  }

  private async handleFailure(deliveryId: string, delivery: any, err: any) {
    this.metrics.emailsFailedTotal.inc();
    const attempts = (delivery.attempts || 0) + 1;
    const reason = this.safeErr(err);

    const patch: any = { status: 'FAILED', attempts, lastError: reason };

    if (attempts < this.maxAttempts()) {
      const nextMs = this.computeBackoffMs(attempts);
      patch.nextAttemptAt = new Date(Date.now() + nextMs);
      this.metrics.deliveriesRetriedTotal.inc();
    } else {
      patch.nextAttemptAt = undefined;
    }

    this.logger.warn('email_send_failed', { deliveryId, attempts, reason, nextAttemptAt: patch.nextAttemptAt });
    return this.repo.update(deliveryId, patch);
  }

  private outgoingEvent(type: string, data: any): BaseEvent<any> {
    return {
      eventId: `notif-${type}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      type,
      version: 1,
      occurredAt: new Date().toISOString(),
      data,
    };
  }

  private async publishSent(deliveryId: string, event: IncomingEvents) {
    await this.publisher.publish({
      eventId: `notif-sent-${deliveryId}`,
      type: OutgoingEventTypes.NotificationSent,
      version: 1,
      correlationId: event.correlationId,
      occurredAt: new Date().toISOString(),
      data: {
        deliveryId,
        eventId: event.eventId,
        eventType: event.type,
        userId: (event.data as any).userId,
        channel: 'email',
        status: 'SENT',
      },
    });
  }

  private async publishFailed(deliveryId: string, event: IncomingEvents, reason: string) {
    await this.publisher.publish({
      eventId: `notif-failed-${deliveryId}`,
      type: OutgoingEventTypes.NotificationFailed,
      version: 1,
      correlationId: event.correlationId,
      occurredAt: new Date().toISOString(),
      data: {
        deliveryId,
        eventId: event.eventId,
        eventType: event.type,
        userId: (event.data as any).userId,
        channel: 'email',
        status: 'FAILED',
        reason,
      },
    });
  }

  private safeErr(err: any) {
    const msg = err?.response?.data?.message || err?.message || 'unknown error';
    return String(msg).slice(0, 500);
  }
}
