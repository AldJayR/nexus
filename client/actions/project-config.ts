"use server";

import type { UpdateProjectInput } from "@/lib/api/project";
import { projectApi } from "@/lib/api/project";
import { requireTeamLead } from "@/lib/helpers/rbac";
import type { Project } from "@/lib/types";

/**
 * Update project configuration
 * Team Lead only - requires role-based access control
 */
export async function updateProjectAction(
  data: UpdateProjectInput
): Promise<Project | null> {
  try {
    await requireTeamLead();
    const project = await projectApi.patchProject(data);
    return project;
  } catch (error) {
    console.error("Failed to update project:", error);
    return null;
  }
}
