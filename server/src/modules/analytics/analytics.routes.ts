import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { 
  getDashboardOverviewHandler, 
  getPhaseAnalyticsHandler, 
  getSprintAnalyticsHandler, 
  getTeamContributionsHandler,
  getTimelineDataHandler
} from "./analytics.controller.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";

export async function analyticsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    "/dashboard/overview",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
    },
    getDashboardOverviewHandler as any
  );

  server.get(
    "/dashboard/phases",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
    },
    getPhaseAnalyticsHandler as any
  );

  server.get(
    "/dashboard/sprints",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
    },
    getSprintAnalyticsHandler as any
  );

  server.get(
    "/dashboard/contributions",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
    },
    getTeamContributionsHandler as any
  );

  server.get(
    "/timeline",
    {
      preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
    },
    getTimelineDataHandler as any
  );
}
