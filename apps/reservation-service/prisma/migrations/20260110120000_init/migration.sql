CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE','CANCELLED','EXPIRED','FULFILLED');

CREATE TABLE "reservations" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "equipmentId" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "status" "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "equipment_state" (
  "equipmentId" TEXT PRIMARY KEY,
  "status" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "reservations_equipmentId_startAt_endAt_idx" ON "reservations"("equipmentId","startAt","endAt");
CREATE INDEX "reservations_userId_startAt_endAt_idx" ON "reservations"("userId","startAt","endAt");
