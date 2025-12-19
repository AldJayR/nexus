import { getTeamMembers as getTeamMembersAction } from "@/actions/team-members";
import type { User } from "@/lib/types/models";

/**
 * Fetches all team members
 * Used in Server Components for initial data loading
 */
export async function getTeamUsers(): Promise<User[]> {
  try {
    const users = await getTeamMembersAction();
    return users;
  } catch (error) {
    console.error("Failed to fetch team users:", error);
    return [];
  }
}
