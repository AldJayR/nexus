import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, TaskQuery } from "./task.schema.js";

const prisma = getPrismaClient();

export async function getTasks(query: TaskQuery) {
  const { sprintId, assigneeId, status } = query;
  return prisma.task.findMany({
    where: {
      sprintId,
      assigneeId,
      status,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  return task;
}

export async function createTask(input: CreateTaskInput) {
  // Verify sprint exists
  const sprint = await prisma.sprint.findUnique({
    where: { id: input.sprintId },
  });

  if (!sprint) {
    throw new NotFoundError("Sprint", input.sprintId);
  }

  return prisma.task.create({
    data: input,
  });
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  return prisma.task.update({
    where: { id },
    data: input,
  });
}

export async function updateTaskStatus(id: string, userId: string, input: UpdateTaskStatusInput) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  return prisma.$transaction(async (tx) => {
    const updatedTask = await tx.task.update({
      where: { id },
      data: {
        status: input.status,
      },
    });

    if (input.comment) {
      await tx.comment.create({
        data: {
          content: input.comment,
          taskId: id,
          authorId: userId,
        },
      });
    }

    return updatedTask;
  });
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  return prisma.task.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function restoreTask(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new NotFoundError("Task", id);
  }

  if (!task.deletedAt) {
    return task;
  }

  return prisma.task.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });
}
