import { phaseApi } from "@/lib/api";
import type { Phase, PhaseDetail } from "@/lib/types";

/**
 * Fetches all phases with basic information
 */
export async function getPhases(): Promise<Phase[]> {
  try {
    const response = await phaseApi.listPhases();
    return response;
  } catch (error) {
    console.error("Failed to fetch phases:", error);
    return [];
  }
}

/**
 * Fetches all phases with detailed information including deliverables
 * Uses Promise.all for parallel fetching
 */
export async function getPhasesWithDetails(): Promise<PhaseDetail[]> {
  try {
    const phases = await phaseApi.listPhases();

    const phasesWithDetails = await Promise.all(
      phases.map(async (phase: Phase) => {
        try {
          const detailResponse = await phaseApi.getPhaseById(phase.id);
          return detailResponse;
        } catch (error) {
          console.error(
            `Failed to fetch details for phase ${phase.id}:`,
            error
          );
          return null;
        }
      })
    );

    return phasesWithDetails.filter(
      (phase: PhaseDetail | null): phase is PhaseDetail => phase !== null
    );
  } catch (error) {
    console.error("Failed to fetch phases with details:", error);
    return [];
  }
}

/**
 * Fetches a single phase by ID with details
 */
export async function getPhaseById(id: string): Promise<PhaseDetail | null> {
  try {
    const response = await phaseApi.getPhaseById(id);
    return response;
  } catch (error) {
    console.error(`Failed to fetch phase ${id}:`, error);
    return null;
  }
}
