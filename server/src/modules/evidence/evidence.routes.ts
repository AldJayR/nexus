import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createEvidenceHandler, getEvidenceByDeliverableHandler, deleteEvidenceHandler } from "./evidence.controller.js";
import { evidenceResponseSchema } from "./evidence.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function evidenceRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.post(
    "/",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      // We don't use Zod validation for body here because it's multipart/form-data
      // Validation happens inside the controller
    },
    createEvidenceHandler as any
  );

  server.get(
    "/deliverable/:deliverableId",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      schema: {
        params: z.object({
          deliverableId: z.string().uuid(),
        }),
      },
    },
    getEvidenceByDeliverableHandler as any
  );

  server.delete(
    "/:id",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
      },
    },
    deleteEvidenceHandler as any
  );
}
