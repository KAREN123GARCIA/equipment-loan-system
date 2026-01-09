import "dotenv/config";
import { PrismaClient, EquipmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.equipment.count();
  if (count > 0) {
    console.log(`[seed] equipment already has ${count} rows, skipping`);
    return;
  }

  await prisma.equipment.createMany({
    data: [
      {
        assetTag: "LAP-0001",
        name: "Laptop Dell Latitude",
        category: "Laptop",
        brand: "Dell",
        model: "Latitude 5420",
        serialNumber: "SN-DEMO-0001",
        status: EquipmentStatus.AVAILABLE,
        location: "Lab A",
        notes: "Seed item"
      },
      {
        assetTag: "PROJ-0001",
        name: "Epson Projector",
        category: "Projector",
        brand: "Epson",
        model: "EB-X41",
        serialNumber: "SN-DEMO-0002",
        status: EquipmentStatus.MAINTENANCE,
        location: "Storage",
        notes: "Seed item"
      }
    ]
  });

  console.log("[seed] inserted demo equipment");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
