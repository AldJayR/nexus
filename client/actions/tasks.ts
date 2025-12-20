"use server";

import type { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

import { taskApi } from "@/lib/api/task";
import {
  createSprintTaskSchema,
  updateTaskStatusSchema,
} from "@/lib/validation";

export async function createSprintTaskAction(input: unknown) {
  try {
    const parsed = createSprintTaskSchema.parse(input);

    await taskApi.createTask({
      sprintId: parsed.sprintId,
      title: parsed.title,
      description: parsed.description ? parsed.description : undefined,
      assigneeId: parsed.assigneeId ? parsed.assigneeId : undefined,
    });

    revalidatePath(`/sprints/${parsed.sprintId}`);
    return { success: true } as const;
  } catch (error) {
    console.error("[createSprintTaskAction] Error:", error);
    return { success: false, error: "Failed to create task" } as const;
  }
}

export async function updateTaskStatusAction(input: unknown) {
  try {
    const parsed = updateTaskStatusSchema.parse(input);
    const comment = parsed.comment === "" ? undefined : parsed.comment;

    await taskApi.updateTaskStatus(parsed.taskId, {
      status: parsed.status,
      comment,
    });

    revalidatePath(`/sprints/${parsed.sprintId}`);
    return { success: true } as const;
  } catch (error) {
    console.error("[updateTaskStatusAction] Error:", error);

    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;
    const apiMessage =
      axiosError.response?.data?.error || axiosError.response?.data?.message;

    return {
      success: false,
      error: apiMessage || "Failed to update task status",
    } as const;
  }
}
