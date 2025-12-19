import { getPrismaClient } from "../../utils/database.js";
import { Prisma } from "../../generated/client.js";

const prisma = getPrismaClient();

export interface CreateActivityLogInput {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
}

export async function createActivityLog(input: CreateActivityLogInput) {
  if (!input.userId) {
    console.warn("🚨 Activity log skipped: missing userId", {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
    });
    return null;
  }

  try {
    console.log("📝 Attempting to create activity log", {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
    });

    const result = await prisma.activityLog.create({
      data: {
        ...input,
        userId: input.userId,
      },
    });

    console.log("✅ Activity log created successfully:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Error creating activity log:", {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("🚨 Prisma error details:", {
        code: error.code,
        message: error.message,
        meta: (error as any).meta,
      });

      if (error.code === "P2003") {
        console.warn("❌ Foreign key constraint violation - userId may not exist in User table");
      }
    }

    return null;
  }
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
