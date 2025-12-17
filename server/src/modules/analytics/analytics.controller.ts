import { FastifyReply, FastifyRequest } from "fastify";
import { 
  getDashboardOverview, 
  getPhaseAnalytics, 
  getSprintAnalytics, 
  getTeamContributions,
  getTimelineData
} from "./analytics.service.js";

export async function getDashboardOverviewHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = await getDashboardOverview();
  return reply.code(200).send(data);
}

export async function getPhaseAnalyticsHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = await getPhaseAnalytics();
  return reply.code(200).send(data);
}

export async function getSprintAnalyticsHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = await getSprintAnalytics();
  return reply.code(200).send(data);
}

export async function getTeamContributionsHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = await getTeamContributions();
  return reply.code(200).send(data);
}

export async function getTimelineDataHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = await getTimelineData();
  return reply.code(200).send(data);
}
