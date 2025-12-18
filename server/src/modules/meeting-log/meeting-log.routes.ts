import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  createMeetingLogHandler,
  getMeetingLogsBySprintHandler,
  getMeetingLogsByPhaseHandler,
  deleteMeetingLogHandler,
} from "./meeting-log.controller.js";
import { createMeetingLogSchema, meetingLogResponseSchema } from "./meeting-log.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function meetingLogRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    // Create Meeting Log (Team Lead or Member)
    // Note: We use raw multipart handling in controller, but schema is for documentation/internal validation
    protectedServer.post("/", {
      schema: {
        body: z.any(), // Multipart handling is manual
        response: {
          201: meetingLogResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD, Role.MEMBER]),
    }, createMeetingLogHandler as any);

    // Get Meeting Logs by Sprint
    protectedServer.get("/sprint/:sprintId", {
      schema: {
        params: z.object({ sprintId: z.string() }),
        response: {
          200: z.array(meetingLogResponseSchema),
        },
      },
    }, getMeetingLogsBySprintHandler as any);

    // Get Meeting Logs by Phase
    protectedServer.get("/phase/:phaseId", {
      schema: {
        params: z.object({ phaseId: z.string() }),
        response: {
          200: z.array(meetingLogResponseSchema),
        },
      },
    }, getMeetingLogsByPhaseHandler as any);

    // Delete Meeting Log (Team Lead only)
    protectedServer.delete("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          204: z.null(),
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, deleteMeetingLogHandler as any);
  });
}
