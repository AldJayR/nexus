import fp from 'fastify-plugin';
import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { getPrismaClient } from '../utils/database.js';

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();

      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { id: true },
      });

      if (!user) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid session. Please sign in again.',
          statusCode: 401,
        });
      }
    } catch (err) {
      reply.send(err);
    }
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string;
      email: string;
      role: string;
      name: string;
    };
  }
}
