import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { UpdateUserInput } from "./user.schema.js";
import { TaskStatus } from "../../generated/client.js";

const prisma = getPrismaClient();

export async function getAllUsers() {
  return prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError("User", id);
  }

  return user;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError("User", id);
  }

  return prisma.user.update({
    where: { id },
    data: input,
  });
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError("User", id);
  }

  return prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function getUserContributions(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError("User", id);
  }

  const [assignedTasksCount, completedTasksCount, uploadedEvidenceCount, commentsCount] = await Promise.all([
    prisma.task.count({
      where: { assigneeId: id, deletedAt: null },
    }),
    prisma.task.count({
      where: { assigneeId: id, status: TaskStatus.DONE, deletedAt: null },
    }),
    prisma.evidence.count({
      where: { uploaderId: id, deletedAt: null },
    }),
    prisma.comment.count({
      where: { authorId: id },
    }),
  ]);

  return {
    assignedTasksCount,
    completedTasksCount,
    uploadedEvidenceCount,
    commentsCount,
  };
}
