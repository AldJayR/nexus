"use server";

import { revalidatePath } from "next/cache";
import { userApi } from "@/lib/api";
import { requireTeamLead } from "@/lib/helpers/rbac";

export async function deleteTeamMembers(userIds: string[]): Promise<void> {
  try {
    await requireTeamLead();
    await Promise.all(userIds.map((id) => userApi.deleteUser(id)));
    revalidatePath("/settings/team-members");
  } catch (error) {
    console.error("Failed to delete team members:", error);
    throw new Error("Failed to delete team members");
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await requireTeamLead();
    await userApi.deleteUser(userId);
    revalidatePath("/settings/team-members");
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function restoreUser(userId: string): Promise<void> {
  try {
    await requireTeamLead();
    await userApi.restoreUser(userId);
    revalidatePath("/settings/team-members");
  } catch (error) {
    console.error("Failed to restore user:", error);
    throw new Error("Failed to restore user");
  }
}
