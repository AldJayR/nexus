import { FastifyReply, FastifyRequest } from "fastify";
import { getAllUsers, getUserById, updateUser, deleteUser, getUserContributions, restoreUser } from "./user.service.js";
import { UpdateUserInput } from "./user.schema.js";
import { Role } from "../../generated/client.js";

export async function getAllUsersHandler(request: FastifyRequest, reply: FastifyReply) {
  const users = await getAllUsers();
  return reply.code(200).send(users);
}

export async function getUserByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = await getUserById(request.params.id);
  return reply.code(200).send(user);
}

export async function updateUserHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserInput }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const currentUser = request.user;

  // Allow if user is updating themselves OR user is Team Lead
  if (currentUser.id !== id && currentUser.role !== Role.TEAM_LEAD) {
    return reply.status(403).send({ message: "Forbidden: You can only update your own profile" });
  }

  // Prevent non-Team Leads from updating roles
  if (request.body.role && currentUser.role !== Role.TEAM_LEAD) {
    return reply.status(403).send({ message: "Forbidden: Only Team Leads can update roles" });
  }

  const user = await updateUser(id, request.body, currentUser.id);
  return reply.code(200).send(user);
}

export async function deleteUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  await deleteUser(request.params.id, request.user!.id);
  return reply.code(204).send();
}

export async function getUserContributionsHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const contributions = await getUserContributions(request.params.id);
  return reply.code(200).send(contributions);
}

export async function restoreUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = await restoreUser(request.params.id, request.user!.id);
  return reply.code(200).send(user);
}
