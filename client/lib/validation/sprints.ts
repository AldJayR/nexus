import { z } from "zod";

export const createSprintSchema = z.object({
  goal: z.string().trim().max(300).optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export type CreateSprintInput = z.infer<typeof createSprintSchema>;
