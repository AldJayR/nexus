import { getPrismaClient, NotFoundError, ValidationError } from "../../utils/database.js";
import { CreateSprintInput, UpdateSprintInput } from "./sprint.schema.js";
import { TaskStatus } from "../../generated/client.js";

const prisma = getPrismaClient();

export async function getSprints() {
  return prisma.sprint.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      startDate: "desc",
    },
  });
}

export async function getSprintById(id: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      tasks: true,
    },
  });

  if (!sprint || sprint.deletedAt) {
    throw new NotFoundError("Sprint", id);
  }

  return sprint;
}

export async function createSprint(input: CreateSprintInput) {
  let { projectId } = input;

  if (!projectId) {
    const project = await prisma.project.findFirst();
    if (!project) {
      throw new ValidationError("No project found. Please create a project first.");
    }
    projectId = project.id;
  }

  const lastSprint = await prisma.sprint.findFirst({
    where: { projectId },
    orderBy: { number: 'desc' },
  });

  const nextNumber = (lastSprint?.number ?? 0) + 1;

  return prisma.sprint.create({
    data: {
      ...input,
      projectId,
      number: nextNumber,
    },
  });
}

export async function updateSprint(id: string, input: UpdateSprintInput) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
  });

  if (!sprint || sprint.deletedAt) {
    throw new NotFoundError("Sprint", id);
  }

  return prisma.sprint.update({
    where: { id },
    data: input,
  });
}

export async function deleteSprint(id: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
  });

  if (!sprint || sprint.deletedAt) {
    throw new NotFoundError("Sprint", id);
  }

  return prisma.sprint.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function getSprintProgress(id: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
  });

  if (!sprint || sprint.deletedAt) {
    throw new NotFoundError("Sprint", id);
  }

  const totalTasks = await prisma.task.count({
    where: { sprintId: id, deletedAt: null },
  });

  const completedTasks = await prisma.task.count({
    where: { sprintId: id, status: TaskStatus.DONE, deletedAt: null },
  });

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    percentage,
  };
}
