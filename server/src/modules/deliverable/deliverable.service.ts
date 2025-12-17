import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { CreateDeliverableInput, UpdateDeliverableInput, DeliverableQuery } from "./deliverable.schema.js";

const prisma = getPrismaClient();

export async function getDeliverables(query: DeliverableQuery) {
  const { phaseId } = query;
  return prisma.deliverable.findMany({
    where: {
      phaseId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getDeliverableById(id: string) {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
    include: {
      evidence: true,
    },
  });

  if (!deliverable || deliverable.deletedAt) {
    throw new NotFoundError("Deliverable", id);
  }

  return deliverable;
}

export async function createDeliverable(input: CreateDeliverableInput) {
  // Verify phase exists
  const phase = await prisma.phase.findUnique({
    where: { id: input.phaseId },
  });

  if (!phase) {
    throw new NotFoundError("Phase", input.phaseId);
  }

  return prisma.deliverable.create({
    data: input,
  });
}

export async function updateDeliverable(id: string, input: UpdateDeliverableInput) {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
  });

  if (!deliverable || deliverable.deletedAt) {
    throw new NotFoundError("Deliverable", id);
  }

  return prisma.deliverable.update({
    where: { id },
    data: input,
  });
}

export async function deleteDeliverable(id: string) {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
  });

  if (!deliverable || deliverable.deletedAt) {
    throw new NotFoundError("Deliverable", id);
  }

  return prisma.deliverable.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function restoreDeliverable(id: string) {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
  });

  if (!deliverable) {
    throw new NotFoundError("Deliverable", id);
  }

  if (!deliverable.deletedAt) {
    return deliverable; // Already active
  }

  return prisma.deliverable.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });
}
