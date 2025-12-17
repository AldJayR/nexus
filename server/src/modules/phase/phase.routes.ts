import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  getAllPhasesHandler,
  getPhaseByIdHandler,
  createPhaseHandler,
  updatePhaseHandler,
  deletePhaseHandler,
} from "./phase.controller.js";
import {
  createPhaseSchema,
  updatePhaseSchema,
  phaseResponseSchema,
  phaseDetailResponseSchema,
} from "./phase.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function phaseRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    // List all phases
    protectedServer.get("/", {
      schema: {
        response: {
          200: z.array(phaseResponseSchema),
        },
      },
    }, getAllPhasesHandler);

    // Get phase by ID
    protectedServer.get("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: phaseDetailResponseSchema,
        },
      },
    }, getPhaseByIdHandler as any);

    // Create phase (Team Lead only)
    protectedServer.post("/", {
      schema: {
        body: createPhaseSchema,
        response: {
          201: phaseResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, createPhaseHandler as any);

    // Update phase (Team Lead only)
    protectedServer.put("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        body: updatePhaseSchema,
        response: {
          200: phaseResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, updatePhaseHandler as any);

    // Delete phase (Team Lead only)
    protectedServer.delete("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          204: z.null(),
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, deletePhaseHandler as any);
  });
}
