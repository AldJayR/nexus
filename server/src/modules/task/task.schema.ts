import { z } from "zod";
import { TaskStatus } from "../../generated/client.js";

export const createTaskSchema = z.object({
  sprintId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const updateTaskSchema = z.object({
  assigneeId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  comment: z.string().optional(), // Required if status is BLOCKED
}).refine((data) => {
  if (data.status === TaskStatus.BLOCKED && !data.comment) {
    return false;
  }
  return true;
}, {
  message: "Comment is required when status is BLOCKED",
  path: ["comment"],
});

export const taskResponseSchema = z.object({
  id: z.string(),
  sprintId: z.string(),
  assigneeId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(TaskStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const taskQuerySchema = z.object({
  sprintId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
