import { z } from "zod";

/**
 * Project Configuration Validation Schemas
 * Schemas for project config and methodology settings.
 */

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
  .or(z.literal(""));

const isoDateTimeString = z.iso.datetime().or(z.literal(""));

const dateRangeSchema = z
  .object({
    start: isoDateString,
    end: isoDateString,
  })
  .refine((value) => {
    if (!(value.start || value.end)) {
      return true;
    }

    if (!(value.start && value.end)) {
      return false;
    }

    return value.start <= value.end;
  }, "Start and end dates are required");

export const methodologyDeliverableSchema = z.object({
  title: z.string().min(1, "Deliverable title is required"),
  description: z.string().optional().or(z.literal("")),
  dueDate: isoDateString.optional(),
  deletedAt: isoDateTimeString.optional(),
});

export const methodologyPhaseSchema = z.object({
  title: z.string().min(1, "Phase title is required"),
  description: z.string().min(1, "Phase description is required"),
  dateRange: dateRangeSchema,
  deliverables: z
    .array(methodologyDeliverableSchema)
    .min(1, "Add at least one deliverable"),
});

const emptyPhaseSchema = z.object({
  title: z.literal(""),
  description: z.literal(""),
  dateRange: z.object({
    start: z.literal(""),
    end: z.literal(""),
  }),
  deliverables: z.array(methodologyDeliverableSchema).max(0),
});

export const methodologySchema = z.object({
  phases: z.object({
    waterfall: methodologyPhaseSchema.or(emptyPhaseSchema),
    scrum: methodologyPhaseSchema.or(emptyPhaseSchema),
    fall: methodologyPhaseSchema.or(emptyPhaseSchema),
  }),
});

export type MethodologyInput = z.infer<typeof methodologySchema>;
