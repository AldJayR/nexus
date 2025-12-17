import { FastifyReply, FastifyRequest } from 'fastify';
import { login, inviteUser, changePassword } from './auth.service.js';
import { LoginInput, InviteUserInput, ChangePasswordInput } from './auth.schema.js';

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  const result = await login(request.body, request.server);
  return reply.code(200).send(result);
}

export async function inviteUserHandler(
  request: FastifyRequest<{ Body: InviteUserInput }>,
  reply: FastifyReply
) {
  const result = await inviteUser(request.body);
  return reply.code(201).send(result);
}

export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
  return { message: 'Logged out successfully' };
}

export async function meHandler(request: FastifyRequest, reply: FastifyReply) {
  return request.user;
}

export async function changePasswordHandler(
  request: FastifyRequest<{ Body: ChangePasswordInput }>,
  reply: FastifyReply
) {
  const result = await changePassword(request.user.id, request.body);
  return reply.code(200).send(result);
}
