import { z } from "zod";

export const createMeetingLogSchema = z.object({
  sprintId: z.string().uuid(),
  title: z.string().min(1),
  date: z.string().datetime(),
});

export const meetingLogResponseSchema = z.object({
  id: z.string(),
  sprintId: z.string(),
  title: z.string(),
  date: z.date(),
  fileUrl: z.string(),
  uploaderId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
