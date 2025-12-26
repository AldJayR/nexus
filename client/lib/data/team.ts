import { userApi } from "@/lib/api";
import { requireTeamLead } from "@/lib/helpers/rbac";
import type { User } from "@/lib/types/models";

/**
 * Fetches all team members
 * Used in Server Components for initial data loading
 * Team Lead only - per US-022 (Team Members can't see full team list)
 */
export async function getTeamUsers(): Promise<User[]> {
  try {
    await requireTeamLead();
    const users = await userApi.listUsers();
    return users;
  } catch (error) {
    console.error("Failed to fetch team users:", error);
    return [];
  }
}
