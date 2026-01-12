import { PrismaClient, LoanStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.loan.count();
  if (count > 0) {
    console.log("[seed] loans already exist, skipping");
    return;
  }

  await prisma.loan.create({
    data: {
      userId: "00000000-0000-0000-0000-000000000000",
      equipmentId: "00000000-0000-0000-0000-000000000000",
      status: LoanStatus.CANCELED,
      notes: "Demo seed loan (placeholder IDs)",
    },
  });

  console.log("[seed] inserted demo loan");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
