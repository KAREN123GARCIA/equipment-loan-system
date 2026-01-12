import { ReservationsExpirationJob } from "./reservations.expiration.job";

describe("ReservationsExpirationJob", () => {
  it("expires reservations older than configured TTL", async () => {
    const cfg = { holdTtlMinutes: () => 30, expirationScanSeconds: () => 30 } as any;
    const repo = {
      expireBatch: jest.fn().mockResolvedValue({ count: 2 }),
      listExpiredSince: jest.fn().mockResolvedValue([{ id: "r1", userId: "u", equipmentId: "e" }]),
    } as any;
    const events = { publish: jest.fn().mockResolvedValue(undefined) } as any;
    const metrics = { reservationExpireTotal: { inc: jest.fn() } } as any;

    const job = new ReservationsExpirationJob(cfg, repo, events, metrics);
    await job.scan();

    expect(repo.expireBatch).toHaveBeenCalled();
    expect(metrics.reservationExpireTotal.inc).toHaveBeenCalledWith(2);
    expect(events.publish).toHaveBeenCalled();
  });
});
