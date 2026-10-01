const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const EMAIL    = 'treborjackson07@yahoo.com';
const PASSWORD = process.argv[2];

if (!PASSWORD) {
  console.error('Usage: node scripts/seed-admin.js <password>');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log('Account already exists for', EMAIL);
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const user = await prisma.user.create({
    data: { email: EMAIL, passwordHash, name: 'Trebor' },
  });
  await prisma.userPreferences.create({ data: { userId: user.id } });
  console.log('✓ Admin account created:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
