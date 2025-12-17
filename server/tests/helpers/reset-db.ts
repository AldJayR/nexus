import { getPrismaClient } from '../../src/utils/database.js';

export async function clearDatabase() {
  const prisma = getPrismaClient();
  
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearDatabase can only be run in test environment');
  }

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}
