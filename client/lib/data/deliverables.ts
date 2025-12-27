import "server-only";

import { deliverableApi } from "@/lib/api/deliverable";
import { evidenceApi } from "@/lib/api/evidence";
import { phaseApi } from "@/lib/api/phase";
import type { Deliverable, Evidence, Phase } from "@/lib/types";
import { requireUser } from "../helpers/rbac";

export async function getDeliverableById(
  id: string
): Promise<Deliverable | null> {
  try {
    await requireUser();
    return await deliverableApi.getDeliverableById(id);
  } catch (error) {
    console.error(`Failed to fetch deliverable ${id}:`, error);
    return null;
  }
}

export async function getPhases(): Promise<Phase[]> {
  try {
    await requireUser();
    return await phaseApi.listPhases();
  } catch (error) {
    console.error("Failed to fetch phases:", error);
    return [];
  }
}

export async function getEvidenceByDeliverable(
  deliverableId: string
): Promise<Evidence[]> {
  try {
    await requireUser();
    return await evidenceApi.getEvidenceByDeliverable(deliverableId);
  } catch (error) {
    console.error(
      `Failed to fetch evidence for deliverable ${deliverableId}:`,
      error
    );
    return [];
  }
}

export async function getDeliverableDetail(deliverableId: string) {
  const [deliverable, phases, evidence] = await Promise.all([
    getDeliverableById(deliverableId),
    getPhases(),
    getEvidenceByDeliverable(deliverableId),
  ]);

  return {
    deliverable,
    phases,
    evidence,
    phase: phases.find((p) => p.id === deliverable?.phaseId),
  };
}
