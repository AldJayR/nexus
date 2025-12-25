import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, TaskQuery } from "./task.schema.js";
import { createNotification } from "../notification/notification.service.js";
import { createActivityLog } from "../activity-log/activity-log.service.js";

const prisma = getPrismaClient();

export async function getTasks(query: TaskQuery) {
  const { sprintId, phaseId, assigneeId, status } = query;
  const tasks = await prisma.task.findMany({
    where: {
      sprintId,
      phaseId,
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
      comments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
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

  // Transform tasks to extract lastComment from most recent comment
  return tasks.map((task) => {
    const { comments, ...taskWithoutComments } = task;
    return {
      ...taskWithoutComments,
      lastComment: comments[0] || null,
    };
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

  // Transform task to extract lastComment from most recent comment
  // Using destructuring to properly exclude comments array
  const { comments, ...taskWithoutComments } = task;
  
  const transformedTask = {
    ...taskWithoutComments,
    lastComment: comments[0] || null,
  };

  return transformedTask;
}

export async function createTask(input: CreateTaskInput, creatorId: string) {
  // Validate Sprint OR Phase
  if (input.sprintId) {
    const sprint = await prisma.sprint.findUnique({ where: { id: input.sprintId } });
    if (!sprint) throw new NotFoundError("Sprint", input.sprintId);
  } else if (input.phaseId) {
    const phase = await prisma.phase.findUnique({ where: { id: input.phaseId } });
    if (!phase) throw new NotFoundError("Phase", input.phaseId);
  } else {
    throw new Error("Task must be linked to a Sprint or a Phase");
  }

  const task = await prisma.task.create({
    data: input,
  });

  // Activity Log
  await createActivityLog({
    userId: creatorId,
    action: "TASK_CREATED",
    entityType: "Task",
    entityId: task.id,
    details: `Task "${task.title}" created`,
  });

  // Notification
  if (input.assigneeId && input.assigneeId !== creatorId) {
    await createNotification({
      userId: input.assigneeId,
      message: `You have been assigned to task: ${task.title}`,
      link: `/tasks/${task.id}`,
    });
  }

  return task;
}

export async function updateTask(id: string, input: UpdateTaskInput, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: input,
  });

  // Activity Log
  await createActivityLog({
    userId,
    action: "TASK_UPDATED",
    entityType: "Task",
    entityId: task.id,
    details: `Task "${task.title}" updated`,
  });

  // Notification if assignee changed
  if (input.assigneeId && input.assigneeId !== task.assigneeId && input.assigneeId !== userId) {
    await createNotification({
      userId: input.assigneeId,
      message: `You have been assigned to task: ${updatedTask.title}`,
      link: `/tasks/${updatedTask.id}`,
    });
  }

  return updatedTask;
}

export async function updateTaskStatus(id: string, userId: string, input: UpdateTaskStatusInput) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  const result = await prisma.$transaction(async (tx) => {
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

  // Activity Log
  await createActivityLog({
    userId,
    action: "TASK_STATUS_CHANGED",
    entityType: "Task",
    entityId: task.id,
    details: `Task "${task.title}" status changed to ${input.status}`,
  });

  // Notification to assignee if someone else changed status
  if (task.assigneeId && task.assigneeId !== userId) {
    await createNotification({
      userId: task.assigneeId,
      message: `Task "${task.title}" status updated to ${input.status}`,
      link: `/tasks/${task.id}`,
    });
  }

  // Blocker notification: notify all Team Leads when a task is blocked
  if (input.status === "BLOCKED") {
    const teamLeads = await prisma.user.findMany({
      where: {
        role: "TEAM_LEAD",
        deletedAt: null,
      },
      select: { id: true },
    });

    // Get the user who blocked it for the message
    const blocker = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    for (const lead of teamLeads) {
      // Don't notify the person who blocked it if they are a Team Lead
      if (lead.id !== userId) {
        await createNotification({
          userId: lead.id,
          message: `🚫 Task "${task.title}" was blocked by ${blocker?.name || 'a team member'}${input.comment ? `: "${input.comment}"` : ''}`,
          link: `/tasks/${task.id}`,
        });
      }
    }
  }

  return result;
}

export async function deleteTask(id: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  await prisma.task.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  await createActivityLog({
    userId,
    action: "TASK_DELETED",
    entityType: "Task",
    entityId: task.id,
    details: `Task "${task.title}" deleted`,
  });
}

export async function restoreTask(id: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new NotFoundError("Task", id);
  }

  if (!task.deletedAt) {
    return task;
  }

  const restoredTask = await prisma.task.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });

  await createActivityLog({
    userId,
    action: "TASK_RESTORED",
    entityType: "Task",
    entityId: task.id,
    details: `Task "${task.title}" restored`,
  });

  return restoredTask;
}
