import { PhaseManager } from "@/components/team-lead/phases/phase-manager";
import { phaseApi } from "@/lib/api/phase";
import type { PhaseDetail } from "@/lib/types";

export const metadata = {
  title: "Project Phases",
  description: "Manage project phases and deliverables",
};

export default async function PhasesPage() {
  // Fetch all phases with their deliverables included
  const phases = await phaseApi.listPhases();
  
  // Fetch detailed information for each phase (includes deliverables)
  const phasesWithDeliverables: PhaseDetail[] = await Promise.all(
    phases.map((phase) => phaseApi.getPhaseById(phase.id))
  );

  return (
    <>
      <PhaseManager phases={phasesWithDeliverables} />
    </>
  );
}
