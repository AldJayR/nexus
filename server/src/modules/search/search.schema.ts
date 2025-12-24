import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search term cannot be empty"),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const searchResponseSchema = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.string(),
    sprintId: z.string().nullable(),
    createdAt: z.date(),
  })),
  deliverables: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.string(),
    phaseId: z.string(),
    createdAt: z.date(),
  })),
  comments: z.array(z.object({
    id: z.string(),
    content: z.string(),
    authorName: z.string(),
    taskId: z.string().nullable(),
    deliverableId: z.string().nullable(),
    createdAt: z.date(),
  })),
  meetingLogs: z.array(z.object({
    id: z.string(),
    title: z.string(),
    date: z.date(),
    fileUrl: z.string(),
  })),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;
