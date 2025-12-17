import { getPrismaClient } from "../../utils/database.js";

const prisma = getPrismaClient();

export interface CreateActivityLogInput {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
}

export async function createActivityLog(input: CreateActivityLogInput) {
  return prisma.activityLog.create({
    data: input,
  });
}

export async function getAllActivityLogs() {
  return prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActivityLogsByEntity(entityType: string, entityId: string) {
  return prisma.activityLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
