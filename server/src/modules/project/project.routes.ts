import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getProjectHandler, createProjectHandler, updateProjectHandler } from "./project.controller.js";
import { createProjectSchema, updateProjectSchema, projectResponseSchema } from "./project.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";

export async function projectRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Public or Authenticated read access? Assuming authenticated for now.
  // If public, move outside of protected block if you have one, or just don't add auth hook.
  // Based on requirements, let's make it protected.

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    protectedServer.get("/", {
      schema: {
        response: {
          200: projectResponseSchema,
        },
      },
    }, getProjectHandler);

    protectedServer.post("/", {
      schema: {
        body: createProjectSchema,
        response: {
          201: projectResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, createProjectHandler as any);

    protectedServer.put("/", {
      schema: {
        body: updateProjectSchema,
        response: {
          200: projectResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, updateProjectHandler as any);

    protectedServer.patch("/", {
        schema: {
          body: updateProjectSchema,
          response: {
            200: projectResponseSchema,
          },
        },
        preHandler: requireRole([Role.TEAM_LEAD]),
      }, updateProjectHandler as any);
  });
}
