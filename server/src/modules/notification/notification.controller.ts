import { FastifyReply, FastifyRequest } from "fastify";
import { 
  createNotification, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from "./notification.service.js";
import { CreateNotificationInput } from "./notification.schema.js"; // Assuming type inference or manual definition

export async function createNotificationHandler(request: FastifyRequest<{ Body: { userId: string; message: string; link?: string } }>, reply: FastifyReply) {
  // This endpoint might be internal or admin only
  const notification = await createNotification(request.body);
  return reply.code(201).send(notification);
}

export async function getUserNotificationsHandler(request: FastifyRequest, reply: FastifyReply) {
  const notifications = await getUserNotifications(request.user!.id);
  return reply.code(200).send(notifications);
}

export async function markNotificationAsReadHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  const notification = await markNotificationAsRead(id, request.user!.id);
  return reply.code(200).send(notification);
}

export async function markAllNotificationsAsReadHandler(request: FastifyRequest, reply: FastifyReply) {
  await markAllNotificationsAsRead(request.user!.id);
  return reply.code(200).send({ message: "All notifications marked as read" });
}

export async function deleteNotificationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  await deleteNotification(id, request.user!.id);
  return reply.code(204).send();
}
