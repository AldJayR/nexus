import { z } from "zod";

export const createSprintSchema = z.object({
  projectId: z.string().optional(),
  name: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const updateSprintSchema = createSprintSchema.partial();

export const sprintResponseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
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
