import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginHandler, inviteUserHandler, logoutHandler, meHandler, changePasswordHandler } from './auth.controller.js';
import { loginSchema, loginResponseSchema, inviteUserSchema, inviteUserResponseSchema, changePasswordSchema } from './auth.schema.js';
import { requireRole } from '../../utils/rbac.js';
import { Role } from '../../generated/client.js';

export async function authRoutes(app: FastifyInstance) {
  // Use Zod Type Provider
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.post('/login', {
    schema: {
      body: loginSchema,
      response: {
        200: loginResponseSchema,
      },
    },
  }, loginHandler);
  
  server.post('/logout', logoutHandler);

  // Protected Routes
  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    
    protectedRoutes.addHook('onRequest', app.authenticate);

    protectedServer.get('/me', meHandler);
    
    protectedServer.post('/change-password', {
      schema: {
        body: changePasswordSchema,
      },
    }, changePasswordHandler);
    
    // Team Lead Only Routes
    protectedServer.post('/invite', { 
      schema: {
        body: inviteUserSchema,
        response: {
          201: inviteUserResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD])
    }, inviteUserHandler);
  });
}

