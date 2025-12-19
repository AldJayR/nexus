import { projectApi } from "@/lib/api";
import type { Project } from "@/lib/types";

/**
 * Fetches the singleton project data
 * Used in Server Components for initial data loading
 */
export async function getProject(): Promise<Project | null> {
  try {
    const response = await projectApi.getProject();
    return response;
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return null;
  }
}
