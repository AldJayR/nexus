import { beforeAll, afterAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { env } from '../src/config/env.js';
import { clearDatabase } from './helpers/reset-db.js';
import { getPrismaClient } from '../src/utils/database.js';

// Set environment to test
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  // Ensure we are connected to the DB
  const prisma = getPrismaClient();
  await prisma.$connect();
});

beforeEach(async () => {
  // Clear database before each test to ensure isolation
  await clearDatabase();
}, 30000); // Increase timeout to 30s

afterAll(async () => {
  const prisma = getPrismaClient();
  await prisma.$disconnect();
});
