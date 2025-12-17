import { FastifyReply, FastifyRequest } from "fastify";
import { Role } from "../generated/client.js";

export function requireRole(allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    if (!user) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(user.role as Role)) {
      return reply.status(403).send({
        message: "Forbidden: You do not have permission to access this resource",
      });
    }
  };
}
