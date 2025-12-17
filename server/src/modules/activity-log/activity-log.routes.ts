import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getAllActivityLogsHandler, getActivityLogsByEntityHandler } from "./activity-log.controller.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function activityLogRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    "/",
    {
      preHandler: [requireRole([Role.TEAM_LEAD, Role.ADVISER])], // Only leads/advisers can view full audit logs
    },
    getAllActivityLogsHandler
  );

  server.get<{ Params: { entityType: string; entityId: string } }>(
    "/entity/:entityType/:entityId",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      schema: {
        params: z.object({
          entityType: z.string(),
          entityId: z.string().uuid(),
        }),
      },
    },
    getActivityLogsByEntityHandler
  );
}
