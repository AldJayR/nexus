import { getPrismaClient, NotFoundError } from "../../utils/database.js";

const prisma = getPrismaClient();

interface CreateNotificationInput {
  userId: string;
  message: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: input,
  });
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new NotFoundError("Notification", id);
  }

  if (notification.userId !== userId) {
    throw new Error("Unauthorized access to notification");
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function deleteNotification(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new NotFoundError("Notification", id);
  }

  if (notification.userId !== userId) {
    throw new Error("Unauthorized access to notification");
  }

  return prisma.notification.delete({
    where: { id },
  });
}
