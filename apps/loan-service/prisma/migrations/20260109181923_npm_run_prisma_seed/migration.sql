-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'RETURNED', 'CANCELED');

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loans_userId_idx" ON "loans"("userId");

-- CreateIndex
CREATE INDEX "loans_equipmentId_idx" ON "loans"("equipmentId");
