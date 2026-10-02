const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@compritas.com' }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@compritas.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
      }
    });
    console.log('✅ Admin user created: admin@compritas.com / admin123');
  } else {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { email: 'admin@compritas.com' },
      data: { password: hashedPassword }
    });
    console.log('✅ Admin user updated/reset: admin@compritas.com / admin123');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
