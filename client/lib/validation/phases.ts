import { z } from "zod";
import { DeliverableStatus } from "@/lib/types";

/**
 * Phases & Deliverables Validation Schemas
 * Centralized schemas for phase and deliverable management forms
 */

// Phase update form
export const phaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type PhaseInput = z.infer<typeof phaseSchema>;

// Deliverable create/update form
export const deliverableSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(DeliverableStatus).optional(),
});

export type DeliverableInput = z.infer<typeof deliverableSchema>;

// Deliverable with phase ID (for creation)
export const createDeliverableSchema = deliverableSchema.extend({
  phaseId: z.string().min(1, "Phase ID is required"),
});

export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>;

// Deliverable with ID (for updates)
export const updateDeliverableSchema = deliverableSchema.extend({
  id: z.string().min(1, "Deliverable ID is required"),
});

export type UpdateDeliverableInput = z.infer<typeof updateDeliverableSchema>;

// Phase with ID (for updates)
export const updatePhaseSchema = phaseSchema.extend({
  id: z.string().min(1, "Phase ID is required"),
});

export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>;
