"use server";

import { phaseApi } from "@/lib/api/phase";
import type { UpdateProjectInput } from "@/lib/api/project";
import { projectApi } from "@/lib/api/project";
import type { PhaseDetail, Project } from "@/lib/types";

/**
 * Fetch the singleton project configuration
 */
export async function getProjectAction(): Promise<Project | null> {
  try {
    const project = await projectApi.getProject();
    return project;
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return null;
  }
}

/**
 * Fetch all project phases with their deliverables
 */
export async function getProjectPhasesAction(): Promise<PhaseDetail[] | null> {
  try {
    const phases = await phaseApi.listPhases();

    // Fetch detailed information for each phase
    const detailedPhases = await Promise.all(
      phases.map((phase) => phaseApi.getPhaseById(phase.id))
    );

    return detailedPhases;
  } catch (error) {
    console.error("Failed to fetch project phases:", error);
    return null;
  }
}

/**
 * Update project configuration
 */
export async function updateProjectAction(
  data: UpdateProjectInput
): Promise<Project | null> {
  try {
    const project = await projectApi.patchProject(data);
    return project;
  } catch (error) {
    console.error("Failed to update project:", error);
    return null;
  }
}
