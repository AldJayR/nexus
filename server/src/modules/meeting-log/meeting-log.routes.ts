import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createMeetingLogHandler, getMeetingLogsBySprintHandler, deleteMeetingLogHandler } from "./meeting-log.controller.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function meetingLogRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    protectedServer.post(
      "/",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      },
      createMeetingLogHandler as any
    );

    protectedServer.get(
      "/sprint/:sprintId",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
        schema: {
          params: z.object({
            sprintId: z.string().uuid(),
          }),
        },
      },
      getMeetingLogsBySprintHandler as any
    );

    protectedServer.delete(
      "/:id",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
        schema: {
          params: z.object({
            id: z.string().uuid(),
          }),
        },
      },
      deleteMeetingLogHandler as any
    );
  });
}
