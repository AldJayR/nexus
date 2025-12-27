"use client";

import { useMemo, useState } from "react";
import {
  DeliverableCard,
  DeliverablesFilters,
  DeliverablesSummaryCards,
} from "@/components/shared/deliverables";
import { getDeliverablesSummary } from "@/hooks/get-deliverables-summary";
import { getFilteredDeliverables } from "@/hooks/get-filtered-deliverables";
import type { Deliverable, Evidence, Phase } from "@/lib/types";
import type { PhaseFilter, StatusFilter } from "@/lib/types/deliverables-types";

type MemberDeliverablesClientProps = {
  deliverables: Deliverable[];
  phases: Phase[];
  evidenceByDeliverableId: Record<string, Evidence[]>;
};

export type { MemberDeliverablesClientProps };

/**
 * Member Deliverables Client Component
 *
 * Read-only view of deliverables for team members.
 * Members can view:
 * - All deliverables they are assigned to
 * - Evidence files and submission history
 * - Project phases and deadlines
 *
 * Members cannot:
 * - Approve or reject deliverables
 * - Request changes
 * - Manage other members' deliverables
 *
 * Uses shared components for consistent UI across all roles.
 * Navigates to /deliverables/[id] for detail view instead of using modal.
 */
export function MemberDeliverablesClient({
  deliverables,
  phases,
  evidenceByDeliverableId,
}: MemberDeliverablesClientProps) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");

  const phaseById = useMemo(
    () => Object.fromEntries(phases.map((phase) => [phase.id, phase] as const)),
    [phases]
  );

  const summary = useMemo(
    () => getDeliverablesSummary(deliverables),
    [deliverables]
  );

  const filtered = useMemo(
    () =>
      getFilteredDeliverables({
        deliverables,
        phaseFilter,
        query,
        statusFilter,
      }),
    [deliverables, phaseFilter, query, statusFilter]
  );

  return (
    <div className="space-y-6">
      <DeliverablesSummaryCards deliverables={deliverables} summary={summary} />

      <DeliverablesFilters
        onPhaseFilterChange={setPhaseFilter}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        phaseFilter={phaseFilter}
        phases={phases}
        query={query}
        statusFilter={statusFilter}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((deliverable) => {
          const evidence = evidenceByDeliverableId[deliverable.id] || [];
          const phase = phaseById[deliverable.phaseId];

          return (
            <DeliverableCard
              deliverable={deliverable}
              evidenceCount={evidence.length}
              key={deliverable.id}
              phase={phase}
            />
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No deliverables found. Try adjusting your filters.
          </p>
        </div>
      ) : null}
    </div>
  );
}
