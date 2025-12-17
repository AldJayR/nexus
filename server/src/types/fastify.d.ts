import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      role: string;
      name: string;
    };
    user: {
      id: string;
      email: string;
      role: string;
      name: string;
    };
  }
}
