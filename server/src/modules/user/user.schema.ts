import { z } from "zod";
import { Role } from "../../generated/client.js";

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.nativeEnum(Role).optional(), // Only Team Lead should be able to update role
});

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(Role),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const userContributionSchema = z.object({
  assignedTasksCount: z.number(),
  completedTasksCount: z.number(),
  uploadedEvidenceCount: z.number(),
  commentsCount: z.number(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
