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
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';
import { notificationRoutes } from './modules/notification/notification.routes.js';
import { activityLogRoutes } from './modules/activity-log/activity-log.routes.js';
import { backupRoutes } from './modules/backup/backup.routes.js';

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
    app.log.error({ error, message: error.message, stack: error.stack, code: error.code }, 'Error caught by global error handler');

    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        message: 'Validation Error',
        errors: error.flatten(),
        statusCode: 400,
      });
    }

    // Handle Fastify multipart errors specifically
    if (error.code === 'FST_FMP_PARTS_LIMIT' || error.code === 'FST_FMP_FILE_SIZE_LIMIT' || error.code === 'FST_FMP_TOO_MANY_BYTES' || error.code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.status(413).send({
            success: false,
            message: 'File payload too large',
            statusCode: 413,
            code: error.code,
        });
    }
    
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

    // Analytics Routes
    api.register(analyticsRoutes, { prefix: '/' }); // Routes already have /dashboard or /timeline prefix

    // Notification Routes
    api.register(notificationRoutes, { prefix: '/notifications' });

    // Activity Log Routes
    api.register(activityLogRoutes, { prefix: '/activity-logs' });

    // Backup Routes
    api.register(backupRoutes, { prefix: '/backup' });
  }, { prefix: '/api/v1' });

  return app;
}

