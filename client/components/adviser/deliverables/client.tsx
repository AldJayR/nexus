"use client";

import { useMemo, useState } from "react";
import {
  DeliverableCard,
  DeliverableDetails,
  DeliverablesFilters,
  DeliverablesSummaryCards,
} from "@/components/shared/deliverables";
import { getDeliverablesSummary } from "@/hooks/get-deliverables-summary";
import { getFilteredDeliverables } from "@/hooks/get-filtered-deliverables";
import type { Deliverable, Evidence, Phase } from "@/lib/types";
import type { PhaseFilter, StatusFilter } from "@/lib/types/deliverables-types";

type AdviserDeliverablesClientProps = {
  deliverables: Deliverable[];
  phases: Phase[];
  evidenceByDeliverableId: Record<string, Evidence[]>;
};

/**
 * Adviser Deliverables Client Component
 *
 * Read-only view of all deliverables for advisers.
 * Advisers can monitor deliverable submissions across the project.
 *
 * Advisers can view:
 * - All deliverables across all projects
 * - Evidence files and submission history
 * - Project phases, deadlines, and overdue items
 * - Deliverable status and completion tracking
 *
 * Advisers cannot:
 * - Approve or reject deliverables
 * - Request changes
 * - Upload evidence
 * - Manage team members
 *
 * Uses shared components for consistent UI across all roles.
 */
export function AdviserDeliverablesClient({
  deliverables,
  phases,
  evidenceByDeliverableId,
}: AdviserDeliverablesClientProps) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<
    string | null
  >(null);

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

  const selectedDeliverable = selectedDeliverableId
    ? deliverables.find((d) => d.id === selectedDeliverableId)
    : null;

  const selectedEvidence =
    selectedDeliverable && selectedDeliverableId
      ? evidenceByDeliverableId[selectedDeliverableId] || []
      : [];

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
              isPending={false}
              key={deliverable.id}
              onApprove={() => {
                // Approval handled in detail dialog
              }}
              onCardClick={() => setSelectedDeliverableId(deliverable.id)}
              onRequestChanges={() => {
                // Request changes handled in detail dialog
              }}
              onViewEvidence={() => {
                // Evidence viewing handled via card click
              }}
              phase={phase}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed px-6 py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No deliverables found. Try adjusting your filters.
          </p>
        </div>
      )}

      {!!selectedDeliverable && (
        <DeliverableDetails
          deliverable={selectedDeliverable}
          evidence={selectedEvidence}
          evidenceCount={selectedEvidence.length}
          isPending={false}
          onApprove={() => {
            // TODO: Implement approval action
          }}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDeliverableId(null);
            }
          }}
          onRequestChanges={() => {
            // TODO: Implement request changes action
          }}
          open={!!selectedDeliverable}
          phase={
            selectedDeliverable && phaseById[selectedDeliverable.phaseId]
              ? phaseById[selectedDeliverable.phaseId]
              : undefined
          }
        />
      )}
    </div>
  );
}

export type { AdviserDeliverablesClientProps };
