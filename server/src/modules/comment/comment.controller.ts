import { FastifyReply, FastifyRequest } from "fastify";
import {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
} from "./comment.service.js";
import { CreateCommentInput, UpdateCommentInput, CommentQuery } from "./comment.schema.js";

export async function getCommentsHandler(
  request: FastifyRequest<{ Querystring: CommentQuery }>,
  reply: FastifyReply
) {
  const comments = await getComments(request.query);
  return reply.code(200).send(comments);
}

export async function getCommentByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const comment = await getCommentById(request.params.id);
  return reply.code(200).send(comment);
}

export async function createCommentHandler(
  request: FastifyRequest<{ Body: CreateCommentInput }>,
  reply: FastifyReply
) {
  const comment = await createComment(request.user.id, request.body);
  return reply.code(201).send(comment);
}

export async function updateCommentHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateCommentInput }>,
  reply: FastifyReply
) {
  const comment = await updateComment(request.params.id, request.user.id, request.body);
  return reply.code(200).send(comment);
}

export async function deleteCommentHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  await deleteComment(request.params.id, request.user.id, request.user.role);
  return reply.code(204).send();
}
