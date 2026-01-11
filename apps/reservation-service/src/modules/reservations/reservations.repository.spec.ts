import { ReservationsRepository } from "./reservations.repository";
import { PrismaService } from "../prisma/prisma.service";
import { ReservationStatus } from "@prisma/client";

describe("ReservationsRepository overlap query", () => {
  it("uses overlap predicate: start < end AND end > start", async () => {
    const prisma = { reservation: { findMany: jest.fn().mockResolvedValue([{ id: "1" }]) } } as any as PrismaService;
    const repo = new ReservationsRepository(prisma);

    const start = new Date("2026-01-10T10:00:00Z");
    const end = new Date("2026-01-10T12:00:00Z");

    await repo.findConflicts("eq", start, end);

    expect(prisma.reservation.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        equipmentId: "eq",
        status: { in: [ReservationStatus.ACTIVE] },
        AND: [{ startAt: { lt: end } }, { endAt: { gt: start } }],
      }),
    }));
  });
});
