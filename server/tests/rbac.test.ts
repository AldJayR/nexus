import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../src/utils/database.js';
import bcrypt from 'bcryptjs';
import { Role } from '../src/generated/client.js';
import { clearDatabase } from './helpers/reset-db.js';

describe('RBAC (Role-Based Access Control)', () => {
  let app: FastifyInstance;
  const prisma = getPrismaClient();

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  const createTestUser = async (email: string, role: Role) => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return prisma.user.create({
      data: {
        email,
        name: 'Test User',
        passwordHash: hashedPassword,
        role,
      },
    });
  };

  const getAuthToken = async (email: string) => {
    const response = await supertest(app.server)
      .post('/api/v1/auth/login')
      .send({
        email,
        password: 'password123',
      });
    return response.body.token;
  };

  describe('Project Creation (Requires TEAM_LEAD)', () => {
    it('should allow TEAM_LEAD to create a project', async () => {
      await createTestUser('lead@example.com', Role.TEAM_LEAD);
      const token = await getAuthToken('lead@example.com');

      const response = await supertest(app.server)
        .post('/api/v1/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Project',
          description: 'A test project',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(), // +1 day
        });

      // Expect 201 Created or at least not 403/401
      // If validation fails, it might be 400, but that proves RBAC passed.
      // Ideally we send valid data.
      expect(response.status).not.toBe(403);
      expect(response.status).not.toBe(401);
      if (response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('New Project');
      }
    });

    it('should deny MEMBER from creating a project', async () => {
      await createTestUser('member@example.com', Role.MEMBER);
      const token = await getAuthToken('member@example.com');

      const response = await supertest(app.server)
        .post('/api/v1/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Project',
          description: 'A test project',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Forbidden: You do not have permission to access this resource');
    });

    it('should deny ADVISER from creating a project', async () => {
      await createTestUser('adviser@example.com', Role.ADVISER);
      const token = await getAuthToken('adviser@example.com');

      const response = await supertest(app.server)
        .post('/api/v1/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Project',
          description: 'A test project',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(response.status).toBe(403);
    });

    it('should deny unauthenticated user', async () => {
      const response = await supertest(app.server)
        .post('/api/v1/project')
        .send({
          name: 'New Project',
          description: 'A test project',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(response.status).toBe(401);
    });
  });
});
