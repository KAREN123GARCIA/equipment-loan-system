import { PrismaClient, ReservationStatus } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  if (await prisma.reservation.count()) return;
  const now = new Date();
  await prisma.reservation.create({
    data: {
      userId: "demo-user-1",
      equipmentId: "demo-equipment-1",
      startAt: new Date(now.getTime() + 60_000),
      endAt: new Date(now.getTime() + 3_600_000),
      status: ReservationStatus.ACTIVE,
      notes: "Seed reservation"
    }
  });
}
main().finally(() => prisma.$disconnect());
