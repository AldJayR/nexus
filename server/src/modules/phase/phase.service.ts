import { getPrismaClient, NotFoundError, ValidationError } from "../../utils/database.js";
import { CreatePhaseInput, UpdatePhaseInput } from "./phase.schema.js";

const prisma = getPrismaClient();

export async function getAllPhases() {
  return prisma.phase.findMany({
    orderBy: {
      createdAt: "asc", // or by startDate?
    },
  });
}

export async function getPhaseById(id: string) {
  const phase = await prisma.phase.findUnique({
    where: { id },
    include: {
      deliverables: true,
    },
  });

  if (!phase) {
    throw new NotFoundError("Phase", id);
  }

  return phase;
}

export async function createPhase(input: CreatePhaseInput) {
  let { projectId } = input;

  if (!projectId) {
    const project = await prisma.project.findFirst();
    if (!project) {
      throw new ValidationError("No project found. Please create a project first.");
    }
    projectId = project.id;
  }

  return prisma.phase.create({
    data: {
      ...input,
      projectId,
    },
  });
}

export async function updatePhase(id: string, input: UpdatePhaseInput) {
  const phase = await prisma.phase.findUnique({
    where: { id },
  });

  if (!phase) {
    throw new NotFoundError("Phase", id);
  }

  return prisma.phase.update({
    where: { id },
    data: input,
  });
}

export async function deletePhase(id: string) {
  const phase = await prisma.phase.findUnique({
    where: { id },
  });

  if (!phase) {
    throw new NotFoundError("Phase", id);
  }

  // Check if phase has deliverables? Maybe prevent delete if it has data?
  // Or cascade delete? Prisma usually handles cascade if configured, or throws error.
  // Let's just try to delete.

  return prisma.phase.delete({
    where: { id },
  });
}
