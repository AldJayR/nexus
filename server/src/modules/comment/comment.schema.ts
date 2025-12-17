import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1),
  taskId: z.string().uuid().optional(),
  deliverableId: z.string().uuid().optional(),
}).refine((data) => {
  return (data.taskId && !data.deliverableId) || (!data.taskId && data.deliverableId);
}, {
  message: "Must provide either taskId or deliverableId, but not both",
  path: ["taskId", "deliverableId"],
});

export const updateCommentSchema = z.object({
  content: z.string().min(1),
});

export const commentResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  authorId: z.string(),
  taskId: z.string().nullable(),
  deliverableId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const commentQuerySchema = z.object({
  taskId: z.string().uuid().optional(),
  deliverableId: z.string().uuid().optional(),
}).refine((data) => {
  return (data.taskId && !data.deliverableId) || (!data.taskId && data.deliverableId);
}, {
  message: "Must provide either taskId or deliverableId",
  path: ["taskId", "deliverableId"],
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentQuery = z.infer<typeof commentQuerySchema>;
