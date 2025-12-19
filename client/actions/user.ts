"use server";

import { createApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { User } from "@/lib/types";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}
