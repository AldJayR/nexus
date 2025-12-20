"use server";

import { revalidatePath } from "next/cache";

import { sprintApi } from "@/lib/api/sprint";
import { cleanDateInput, toISODateTime } from "@/lib/helpers/date";
import { createSprintSchema } from "@/lib/validation";

export async function createSprintAction(input: unknown) {
  try {
    const parsed = createSprintSchema.parse(input);

    // Dates are required by schema, so they're guaranteed to be non-empty strings
    const startDate = cleanDateInput(parsed.startDate);
    const endDate = cleanDateInput(parsed.endDate);

    if (!(startDate && endDate)) {
      throw new Error("Start date and end date are required");
    }

    const transformed = {
      goal: parsed.goal || "",
      startDate: toISODateTime(startDate)!,
      endDate: toISODateTime(endDate)!,
    };

    await sprintApi.createSprint(transformed);
    revalidatePath("/sprints");

    return { success: true } as const;
  } catch (error) {
    console.error("[createSprintAction] Error:", error);
    return { success: false, error: "Failed to create sprint" } as const;
  }
}
