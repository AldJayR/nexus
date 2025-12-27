"use server";

import { revalidatePath } from "next/cache";
import { sprintApi } from "@/lib/api/sprint";
import { requireTeamLead } from "@/lib/helpers/rbac";
import { createSprintSchema } from "@/lib/validation";

export type UpdateSprintActionInput = {
  id: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
};

export async function updateSprintAction(input: UpdateSprintActionInput) {
  try {
    await requireTeamLead();

    const parsed = createSprintSchema.parse({
      goal: input.goal,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    await sprintApi.updateSprint(input.id, parsed);
    revalidatePath("/sprints");

    return { success: true } as const;
  } catch (error) {
    console.error("[updateSprintAction] Error:", error);
    return { success: false, error: "Failed to update sprint" } as const;
  }
}

export async function deleteSprintAction(id: string) {
  try {
    await requireTeamLead();
    await sprintApi.deleteSprint(id);
    revalidatePath("/sprints");

    return { success: true } as const;
  } catch (error) {
    console.error("[deleteSprintAction] Error:", error);
    return { success: false, error: "Failed to delete sprint" } as const;
  }
}
