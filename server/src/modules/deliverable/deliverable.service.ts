import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { CreateDeliverableInput, UpdateDeliverableInput, DeliverableQuery } from "./deliverable.schema.js";
import { createActivityLog } from "../activity-log/activity-log.service.js";

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

export async function createDeliverable(input: CreateDeliverableInput, userId: string) {
  // Verify phase exists
  const phase = await prisma.phase.findUnique({
    where: { id: input.phaseId },
  });

  if (!phase) {
    throw new NotFoundError("Phase", input.phaseId);
  }

  const deliverable = await prisma.deliverable.create({
    data: input,
  });

  await createActivityLog({
    userId,
    action: "DELIVERABLE_CREATED",
    entityType: "Deliverable",
    entityId: deliverable.id,
    details: `Deliverable "${deliverable.title}" created`,
  });

  return deliverable;
}

export async function updateDeliverable(id: string, input: UpdateDeliverableInput, userId: string) {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
  });

  if (!deliverable || deliverable.deletedAt) {
    throw new NotFoundError("Deliverable", id);
  }

  const updatedDeliverable = await prisma.deliverable.update({
    where: { id },
    data: input,
  });

  if (input.status && input.status !== deliverable.status) {
    await createActivityLog({
      userId,
      action: "DELIVERABLE_STATUS_CHANGED",
      entityType: "Deliverable",
      entityId: deliverable.id,
      details: `Deliverable "${deliverable.title}" status changed to ${input.status}`,
    });
  }

  return updatedDeliverable;
}

export async function deleteDeliverable(id: string, userId: string) {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
  });

  if (!deliverable || deliverable.deletedAt) {
    throw new NotFoundError("Deliverable", id);
  }

  await prisma.deliverable.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  await createActivityLog({
    userId,
    action: "DELIVERABLE_DELETED",
    entityType: "Deliverable",
    entityId: deliverable.id,
    details: `Deliverable "${deliverable.title}" deleted`,
  });
}

export async function restoreDeliverable(id: string, userId: string) {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
  });

  if (!deliverable) {
    throw new NotFoundError("Deliverable", id);
  }

  if (!deliverable.deletedAt) {
    return deliverable; // Already active
  }

  const restoredDeliverable = await prisma.deliverable.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });

  await createActivityLog({
    userId,
    action: "DELIVERABLE_RESTORED",
    entityType: "Deliverable",
    entityId: deliverable.id,
    details: `Deliverable "${deliverable.title}" restored`,
  });

  return restoredDeliverable;
}
