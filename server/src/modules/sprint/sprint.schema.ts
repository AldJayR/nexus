import { z } from "zod";

export const createSprintSchema = z.object({
  projectId: z.string().optional(),
  number: z.number().optional(), // Auto-generated if not provided
  goal: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const updateSprintSchema = createSprintSchema.partial();

export const sprintResponseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  number: z.number(),
  goal: z.string().nullable(),
  startDate: z.date(),
  endDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const sprintProgressSchema = z.object({
  totalTasks: z.number(),
  completedTasks: z.number(),
  percentage: z.number(),
});

export type CreateSprintInput = z.infer<typeof createSprintSchema>;
export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;
