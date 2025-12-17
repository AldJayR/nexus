import { FastifyReply, FastifyRequest } from "fastify";
import { getAllPhases, getPhaseById, createPhase, updatePhase, deletePhase } from "./phase.service.js";
import { CreatePhaseInput, UpdatePhaseInput } from "./phase.schema.js";

export async function getAllPhasesHandler(request: FastifyRequest, reply: FastifyReply) {
  const phases = await getAllPhases();
  return reply.code(200).send(phases);
}

export async function getPhaseByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const phase = await getPhaseById(request.params.id);
  return reply.code(200).send(phase);
}

export async function createPhaseHandler(
  request: FastifyRequest<{ Body: CreatePhaseInput }>,
  reply: FastifyReply
) {
  const phase = await createPhase(request.body, request.user!.id);
  return reply.code(201).send(phase);
}

export async function updatePhaseHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdatePhaseInput }>,
  reply: FastifyReply
) {
  const phase = await updatePhase(request.params.id, request.body, request.user!.id);
  return reply.code(200).send(phase);
}

export async function deletePhaseHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  await deletePhase(request.params.id, request.user!.id);
  return reply.code(204).send();
}
