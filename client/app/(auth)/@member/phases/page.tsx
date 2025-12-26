import { MemberPhaseCard } from "@/components/member/phases/member-phase-card";
import { phaseApi } from "@/lib/api/phase";
import type { PhaseDetail } from "@/lib/types";

export const metadata = {
  title: "Project Phases",
  description: "View project phases and deliverables",
};

export default async function PhasesPage() {
  // Fetch all phases with their deliverables included
  const phases = await phaseApi.listPhases();

  // Fetch detailed information for each phase (includes deliverables)
  const phasesWithDeliverables: PhaseDetail[] = await Promise.all(
    phases.map((phase) => phaseApi.getPhaseById(phase.id))
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {phasesWithDeliverables.map((phase) => (
        <MemberPhaseCard key={phase.id} phase={phase} />
      ))}
    </div>
  );
}
