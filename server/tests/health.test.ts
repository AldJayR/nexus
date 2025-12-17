import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

describe('Health Check', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health should return 200 OK', async () => {
    const response = await supertest(app.server)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('GET /api/v1/ should return welcome message', async () => {
    const response = await supertest(app.server)
      .get('/api/v1/')
      .expect(200);

    expect(response.body).toEqual({ message: 'Welcome to Nexus API v1' });
  });
});
