import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  getDeliverablesHandler,
  getDeliverableByIdHandler,
  createDeliverableHandler,
  updateDeliverableHandler,
  deleteDeliverableHandler,
  restoreDeliverableHandler,
} from "./deliverable.controller.js";
import {
  createDeliverableSchema,
  updateDeliverableSchema,
  deliverableResponseSchema,
  deliverableQuerySchema,
} from "./deliverable.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function deliverableRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    // List deliverables
    protectedServer.get("/", {
      schema: {
        querystring: deliverableQuerySchema,
        response: {
          200: z.array(deliverableResponseSchema),
        },
      },
    }, getDeliverablesHandler as any);

    // Get deliverable by ID
    protectedServer.get("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: deliverableResponseSchema,
        },
      },
    }, getDeliverableByIdHandler as any);

    // Create deliverable (Team Lead only)
    protectedServer.post("/", {
      schema: {
        body: createDeliverableSchema,
        response: {
          201: deliverableResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, createDeliverableHandler as any);

    // Update deliverable (Team Lead only)
    protectedServer.put("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        body: updateDeliverableSchema,
        response: {
          200: deliverableResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, updateDeliverableHandler as any);

    // Delete deliverable (Team Lead only)
    protectedServer.delete("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          204: z.null(),
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, deleteDeliverableHandler as any);

    // Restore deliverable (Team Lead only)
    protectedServer.post("/:id/restore", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: deliverableResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, restoreDeliverableHandler as any);
  });
}
