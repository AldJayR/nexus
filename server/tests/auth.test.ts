import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../src/utils/database.js';
import bcrypt from 'bcryptjs';

describe('Authentication', () => {
  let app: FastifyInstance;
  const prisma = getPrismaClient();

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create a user manually
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: hashedPassword,
          role: 'MEMBER',
        },
      });

      const response = await supertest(app.server)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should fail with invalid password', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          email: 'test2@example.com',
          name: 'Test User 2',
          passwordHash: hashedPassword,
          role: 'MEMBER',
        },
      });

      const response = await supertest(app.server)
        .post('/api/v1/auth/login')
        .send({
          email: 'test2@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should fail with non-existent user', async () => {
      const response = await supertest(app.server)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });
  });
});
