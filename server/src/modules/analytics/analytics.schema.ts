import { z } from "zod";

export const dashboardOverviewSchema = z.object({
  projectProgress: z.number(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  totalSprints: z.number(),
  activeSprint: z.object({
    id: z.string(),
    name: z.string(),
    number: z.number(),
    endDate: z.date(),
  }).nullable(),
  daysRemaining: z.number().nullable(),
});

export const phaseProgressSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.string(), // Derived from deliverables? or just active/completed based on dates
  progress: z.number(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  totalDeliverables: z.number(),
  completedDeliverables: z.number(),
});

export const sprintProgressSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number(),
  status: z.string(), // Active, Completed, Future
  progress: z.number(),
  startDate: z.date(),
  endDate: z.date(),
  totalTasks: z.number(),
  completedTasks: z.number(),
});

export const contributionSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  tasksAssigned: z.number(),
  tasksCompleted: z.number(),
  completionRate: z.number(),
});

export const timelineItemSchema = z.object({
  id: z.string(),
  type: z.enum(["Phase", "Sprint"]),
  name: z.string(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  status: z.string(),
  progress: z.number(),
});

export const timelineResponseSchema = z.array(timelineItemSchema);
