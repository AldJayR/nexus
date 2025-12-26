import { createApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { requireUser } from "@/lib/helpers/rbac";
import type { User } from "@/lib/types";

/**
 * Fetches the current authenticated user
 * Used in Server Components to get user details
 * All authenticated roles can access their own data
 *
 * @returns Current user data or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    await requireUser();
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}
