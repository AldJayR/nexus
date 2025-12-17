import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { 
  createNotificationHandler, 
  getUserNotificationsHandler, 
  markNotificationAsReadHandler, 
  markAllNotificationsAsReadHandler, 
  deleteNotificationHandler 
} from "./notification.controller.js";
import { createNotificationSchema } from "./notification.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function notificationRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Create notification (Internal/Admin use mostly, but exposing for now)
  server.post<{ Body: { userId: string; message: string; link?: string } }>(
    "/",
    {
      preHandler: [requireRole([Role.TEAM_LEAD, Role.ADVISER])], // Only leads/advisers can manually trigger notifications via API
      schema: {
        body: createNotificationSchema,
      },
    },
    createNotificationHandler
  );

  server.get(
    "/",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
    },
    getUserNotificationsHandler
  );

  server.patch<{ Params: { id: string } }>(
    "/:id/read",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
      },
    },
    markNotificationAsReadHandler
  );

  server.patch(
    "/read-all",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
    },
    markAllNotificationsAsReadHandler
  );

  server.delete<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
      },
    },
    deleteNotificationHandler
  );
}
