import { z } from "zod";
import { DeliverableStatus } from "../../generated/client.js";

export const createDeliverableSchema = z.object({
  phaseId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const updateDeliverableSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(DeliverableStatus).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const deliverableResponseSchema = z.object({
  id: z.string(),
  phaseId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(DeliverableStatus),
  dueDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const deliverableQuerySchema = z.object({
  phaseId: z.string().uuid().optional(),
});

export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>;
export type UpdateDeliverableInput = z.infer<typeof updateDeliverableSchema>;
export type DeliverableQuery = z.infer<typeof deliverableQuerySchema>;
