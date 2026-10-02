const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: {
      canAccessPOS: true,
      canAccessInventory: true,
      canAccessCustomers: true,
      canAccessExpenses: true,
      canAccessReports: true,
      canAccessSettings: true,
    }
  });
  console.log('✅ Admin permissions synced!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
