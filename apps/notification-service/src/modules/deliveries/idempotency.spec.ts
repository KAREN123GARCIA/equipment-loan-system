import { DeliveriesService } from './deliveries.service';

describe('Idempotency', () => {
  it('skips when event already processed', async () => {
    const repo: any = { findByEventId: jest.fn().mockResolvedValue({ _id: 'd1', eventId: 'evt-1' }) };
    const svc = new DeliveriesService(
      repo,
      {} as any,
      {} as any,
      {} as any,
      { info: jest.fn(), warn: jest.fn() } as any,
      { emailsSentTotal: { inc: jest.fn() }, emailsFailedTotal: { inc: jest.fn() }, deliveriesRetriedTotal: { inc: jest.fn() } } as any,
      { publish: jest.fn() } as any,
    );
    const res = await svc.processEvent({ eventId:'evt-1', type:'LoanApproved', version:1, occurredAt:new Date().toISOString(), data:{ userId:'u1' } } as any);
    expect(res.eventId).toBe('evt-1');
  });
});
