import { PhaseManager } from "@/components/team-lead/phases/phase-manager";
import { deliverableApi } from "@/lib/api/deliverable";
import { phaseApi } from "@/lib/api/phase";
import type { PhaseDetail } from "@/lib/types";

export const metadata = {
  title: "Project Phases",
  description: "Manage project phases and deliverables",
};

export default async function PhasesPage() {
  // Fetch data in parallel
  const [phases, deliverables] = await Promise.all([
    phaseApi.listPhases(),
    deliverableApi.listDeliverables(),
  ]);

  // Merge deliverables into phases
  const phasesWithDeliverables: PhaseDetail[] = phases.map((phase) => ({
    ...phase,
    deliverables: deliverables.filter((d) => d.phaseId === phase.id),
  }));

  return (
    <div className="">
      <PhaseManager phases={phasesWithDeliverables} />
    </div>
  );
}
