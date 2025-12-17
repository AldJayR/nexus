import { z } from "zod";
import { PhaseType, DeliverableStatus } from "../../generated/client.js";

export const createPhaseSchema = z.object({
  projectId: z.string().optional(), // Optional, will default to singleton project if missing
  type: z.nativeEnum(PhaseType),
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updatePhaseSchema = createPhaseSchema.partial();

export const phaseResponseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.nativeEnum(PhaseType),
  name: z.string(),
  description: z.string().nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Simple deliverable schema for embedding
const embeddedDeliverableSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.nativeEnum(DeliverableStatus),
  description: z.string().nullable(),
});

export const phaseDetailResponseSchema = phaseResponseSchema.extend({
  deliverables: z.array(embeddedDeliverableSchema),
});

export type CreatePhaseInput = z.infer<typeof createPhaseSchema>;
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>;
