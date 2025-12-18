"use server";

import type { User } from "@/lib/types/models";
import { UserRole } from "@/lib/types/models";

// Test data
const TEST_USERS: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
    role: UserRole.MEMBER,
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    role: UserRole.MEMBER,
    createdAt: "2025-01-02T10:00:00Z",
    updatedAt: "2025-01-14T10:00:00Z",
  },
  {
    id: "3",
    email: "mike.johnson@example.com",
    name: "Mike Johnson",
    role: UserRole.ADVISER,
    createdAt: "2025-01-03T10:00:00Z",
    updatedAt: "2025-01-13T10:00:00Z",
  },
  {
    id: "4",
    email: "sarah.williams@example.com",
    name: "Sarah Williams",
    role: UserRole.MEMBER,
    createdAt: "2025-01-04T10:00:00Z",
    updatedAt: "2025-01-12T10:00:00Z",
  },
  {
    id: "5",
    email: "alex.brown@example.com",
    name: "Alex Brown",
    role: UserRole.MEMBER,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-11T10:00:00Z",
    deletedAt: "2025-01-10T10:00:00Z",
  },
];

export async function getTeamMembers(): Promise<User[]> {
  try {
    await Promise.resolve();
    // TODO: Replace with actual API call when available
    // const response = await apiClient.get('/users');
    // return response.data;
    return TEST_USERS;
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    throw new Error("Failed to fetch team members");
  }
}

export async function deleteTeamMembers(userIds: string[]): Promise<void> {
  try {
    await Promise.resolve();
    // TODO: Replace with actual API call when available
    // await apiClient.delete('/users', { data: { ids: userIds } });
    console.log("Deleting users:", userIds);
  } catch (error) {
    console.error("Failed to delete team members:", error);
    throw new Error("Failed to delete team members");
  }
}
