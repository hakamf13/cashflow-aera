import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.paymentMethod.createMany({
    data: [
      { name: "Cash" },
      { name: "QRIS" },
      { name: "Transfer" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed payment methods done");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });