import { FastifyReply, FastifyRequest } from "fastify";
import { getProject, createProject, updateProject } from "./project.service.js";
import { CreateProjectInput, UpdateProjectInput } from "./project.schema.js";

export async function getProjectHandler(request: FastifyRequest, reply: FastifyReply) {
  const project = await getProject();
  return reply.code(200).send(project);
}

export async function createProjectHandler(
  request: FastifyRequest<{ Body: CreateProjectInput }>,
  reply: FastifyReply
) {
  const project = await createProject(request.body);
  return reply.code(201).send(project);
}

export async function updateProjectHandler(
  request: FastifyRequest<{ Body: UpdateProjectInput }>,
  reply: FastifyReply
) {
  const project = await updateProject(request.body);
  return reply.code(200).send(project);
}
