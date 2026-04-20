const { PrismaClient } = require('@prisma/client');
async function start() {
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRawUnsafe('ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "indicacao" TEXT');
    console.log('DB schema verified');
  } catch (e) {
    console.log('DB check skipped:', e.message);
  } finally {
    await prisma.$disconnect();
  }
  require('./dist/server.js');
}
start();
