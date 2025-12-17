import { FastifyReply, FastifyRequest } from "fastify";
import {
  getDeliverables,
  getDeliverableById,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  restoreDeliverable,
} from "./deliverable.service.js";
import { CreateDeliverableInput, UpdateDeliverableInput, DeliverableQuery } from "./deliverable.schema.js";

export async function getDeliverablesHandler(
  request: FastifyRequest<{ Querystring: DeliverableQuery }>,
  reply: FastifyReply
) {
  const deliverables = await getDeliverables(request.query);
  return reply.code(200).send(deliverables);
}

export async function getDeliverableByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const deliverable = await getDeliverableById(request.params.id);
  return reply.code(200).send(deliverable);
}

export async function createDeliverableHandler(
  request: FastifyRequest<{ Body: CreateDeliverableInput }>,
  reply: FastifyReply
) {
  const deliverable = await createDeliverable(request.body, request.user!.id);
  return reply.code(201).send(deliverable);
}

export async function updateDeliverableHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateDeliverableInput }>,
  reply: FastifyReply
) {
  const deliverable = await updateDeliverable(request.params.id, request.body, request.user!.id);
  return reply.code(200).send(deliverable);
}

export async function deleteDeliverableHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  await deleteDeliverable(request.params.id, request.user!.id);
  return reply.code(204).send();
}

export async function restoreDeliverableHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const deliverable = await restoreDeliverable(request.params.id, request.user!.id);
  return reply.code(200).send(deliverable);
}
