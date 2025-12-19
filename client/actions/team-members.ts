"use server";

import { userApi } from "@/lib/api";
import type { User } from "@/lib/types/models";

export async function getTeamMembers(): Promise<User[]> {
  try {
    const users = await userApi.listUsers();
    return users;
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    throw new Error("Failed to fetch team members");
  }
}

export async function deleteTeamMembers(userIds: string[]): Promise<void> {
  try {
    await Promise.all(userIds.map((id) => userApi.deleteUser(id)));
  } catch (error) {
    console.error("Failed to delete team members:", error);
    throw new Error("Failed to delete team members");
  }
}
