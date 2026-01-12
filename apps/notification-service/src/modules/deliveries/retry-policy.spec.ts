import { DeliveriesService } from './deliveries.service';

describe('Retry policy', () => {
  it('exponential backoff grows', () => {
    const svc: any = Object.create(DeliveriesService.prototype);
    process.env.DELIVERY_INITIAL_BACKOFF_MS = '2000';
    process.env.DELIVERY_MAX_BACKOFF_MS = '60000';
    const a1 = svc.computeBackoffMs(1);
    const a2 = svc.computeBackoffMs(2);
    expect(a2).toBeGreaterThan(a1);
  });
});
