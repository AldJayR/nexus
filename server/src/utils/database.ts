import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Singleton Prisma Client with connection pooling
let prisma: PrismaClient;

/**
 * Initialize Prisma Client with connection pooling configuration
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
      errorFormat: 'pretty',
    });

    // Handle connection errors
    prisma.$on('error' as never, (e: any) => {
      console.error('Prisma Client Error:', e);
    });
  }

  return prisma;
}

/**
 * PostgreSQL connection pool configuration
 * Use this for direct database access when needed
 */
export function createPostgresPool(): Pool {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
  });

  pool.on('connect', () => {
    console.log('✅ PostgreSQL pool connected');
  });

  return pool;
}

/**
 * Graceful shutdown - close database connections
 */
export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    console.log('✅ Prisma Client disconnected');
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Custom error classes for database operations
 */
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends DatabaseError {
  constructor(entity: string, id: string) {
    super(`${entity} with ID ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Soft delete utility function
 */
export async function softDelete<T extends { deletedAt?: Date | null }>(
  model: any,
  id: string
): Promise<T> {
  try {
    const result = await model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return result;
  } catch (error) {
    throw new DatabaseError('Failed to soft delete record', error);
  }
}

/**
 * Restore soft-deleted record
 */
export async function restoreSoftDeleted<T extends { deletedAt?: Date | null }>(
  model: any,
  id: string
): Promise<T> {
  try {
    const result = await model.update({
      where: { id },
      data: { deletedAt: null },
    });
    return result;
  } catch (error) {
    throw new DatabaseError('Failed to restore record', error);
  }
}

/**
 * Find with soft delete filter (exclude deleted records by default)
 */
export function excludeDeleted() {
  return {
    deletedAt: null,
  };
}

/**
 * Transaction wrapper with error handling
 */
export async function withTransaction<T>(
  callback: (prisma: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  const client = getPrismaClient();
  try {
    return await client.$transaction(async (tx: Prisma.TransactionClient) => {
      return await callback(tx);
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw new DatabaseError('Transaction failed', error);
  }
}

export default getPrismaClient;
