import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  getSprintsHandler,
  getSprintByIdHandler,
  createSprintHandler,
  updateSprintHandler,
  deleteSprintHandler,
  restoreSprintHandler,
  getSprintProgressHandler,
} from "./sprint.controller.js";
import {
  createSprintSchema,
  updateSprintSchema,
  sprintResponseSchema,
  sprintProgressSchema,
} from "./sprint.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function sprintRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    // List sprints
    protectedServer.get("/", {
      schema: {
        response: {
          200: z.array(sprintResponseSchema),
        },
      },
    }, getSprintsHandler);

    // Get sprint by ID
    protectedServer.get("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: sprintResponseSchema, // TODO: Add tasks to schema if needed
        },
      },
    }, getSprintByIdHandler as any);

    // Create sprint (Team Lead only)
    protectedServer.post("/", {
      schema: {
        body: createSprintSchema,
        response: {
          201: sprintResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, createSprintHandler as any);

    // Update sprint (Team Lead only)
    protectedServer.put("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        body: updateSprintSchema,
        response: {
          200: sprintResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, updateSprintHandler as any);

    // Delete sprint (Team Lead only)
    protectedServer.delete("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          204: z.null(),
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, deleteSprintHandler as any);

    // Restore sprint (Team Lead only)
    protectedServer.post("/:id/restore", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: sprintResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, restoreSprintHandler as any);

    // Get sprint progress
    protectedServer.get("/:id/progress", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: sprintProgressSchema,
        },
      },
    }, getSprintProgressHandler as any);
  });
}
