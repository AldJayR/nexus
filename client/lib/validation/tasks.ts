import { z } from "zod";

const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"]);

export const createSprintTaskSchema = z.object({
  sprintId: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
});

export const updateTaskStatusSchema = z
  .object({
    sprintId: z.string().uuid(),
    taskId: z.string().uuid(),
    status: taskStatusSchema,
    comment: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.status !== "BLOCKED") {
        return true;
      }
      return Boolean(data.comment);
    },
    {
      message: "Reason is required when status is Blocked",
      path: ["comment"],
    }
  );

export type CreateSprintTaskInput = z.infer<typeof createSprintTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
