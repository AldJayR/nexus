import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { ZodError } from 'zod';
import jwtPlugin from './plugins/jwt.js';
import { env } from './config/env.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { projectRoutes } from './modules/project/project.routes.js';
import { userRoutes } from './modules/user/user.routes.js';
import { phaseRoutes } from './modules/phase/phase.routes.js';
import { deliverableRoutes } from './modules/deliverable/deliverable.routes.js';
import { sprintRoutes } from './modules/sprint/sprint.routes.js';
import { taskRoutes } from './modules/task/task.routes.js';
import { commentRoutes } from './modules/comment/comment.routes.js';
import { evidenceRoutes } from './modules/evidence/evidence.routes.js';
import { meetingLogRoutes } from './modules/meeting-log/meeting-log.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'debug' : 'info',
      transport: env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined,
    },
  });

  // Set up Zod validation
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register Plugins
  
  // CORS
  await app.register(cors, {
    origin: [env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Multipart (File Uploads)
  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE,
    },
  });

  // JWT Authentication
  await app.register(jwtPlugin);

  // Global Error Handler
  app.setErrorHandler((error: any, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        message: 'Validation Error',
        errors: error.flatten(),
        statusCode: 400,
      });
    }

    app.log.error(error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    reply.status(statusCode).send({
      success: false,
      error: message,
      statusCode,
      stack: env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  });

  // Health Check Route
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API Routes Prefix
  app.register(async (api) => {
    api.get('/', async () => {
      return { message: 'Welcome to Nexus API v1' };
    });
    
    // Auth Routes
    api.register(authRoutes, { prefix: '/auth' });

    // Project Routes
    api.register(projectRoutes, { prefix: '/project' });

    // User Routes
    api.register(userRoutes, { prefix: '/users' });

    // Phase Routes
    api.register(phaseRoutes, { prefix: '/phases' });

    // Deliverable Routes
    api.register(deliverableRoutes, { prefix: '/deliverables' });

    // Sprint Routes
    api.register(sprintRoutes, { prefix: '/sprints' });

    // Task Routes
    api.register(taskRoutes, { prefix: '/tasks' });

    // Comment Routes
    api.register(commentRoutes, { prefix: '/comments' });

    // Evidence Routes
    api.register(evidenceRoutes, { prefix: '/evidence' });

    // Meeting Log Routes
    api.register(meetingLogRoutes, { prefix: '/meeting-logs' });
  }, { prefix: '/api/v1' });

  return app;
}

