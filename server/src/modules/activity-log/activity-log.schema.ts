import { z } from "zod";

export const activityLogResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: z.object({
    name: z.string(),
    email: z.string(),
  }),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  details: z.string().nullable(),
  createdAt: z.date(),
});
