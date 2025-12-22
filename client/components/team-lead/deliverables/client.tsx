/**
 * Deliverables Client Component (Team Lead View)
 *
 * Interactive React component for managing deliverables in the team lead dashboard.
 * Provides features for:
 * - Viewing deliverables with filtering and sorting
 * - Approving completed evidence submissions
 * - Requesting changes with feedback
 * - Viewing evidence history and file uploads
 *
 * State Management:
 * - phaseFilter: Filter deliverables by phase
 * - statusFilter: Filter by status (not-started, in-progress, review, completed)
 * - viewMode: Toggle between grid and list views
 * - Dialogs for approval and evidence viewing
 *
 * Permissions:
 * - Can approve deliverables with status=REVIEW
 * - Can request changes and add feedback comments
 * - Can view all uploaded evidence files
 */
"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  approveDeliverableAction,
  requestChangesDeliverableAction,
} from "@/actions/deliverables";
import type { Deliverable, Evidence, Phase } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DeliverableCard } from "./deliverable-card";
import { DeliverableDetails } from "./deliverable-details";
import type { PhaseFilter, StatusFilter, ViewMode } from "./deliverables-types";
import { DeliverablesFilters } from "./filters";
import { getDeliverablesSummary } from "./get-deliverables-summary";
import { getFilteredDeliverables } from "./get-filtered-deliverables";
import { RequestChangesDialog } from "./request-changes-dialog";
import { DeliverablesSummaryCards } from "./summary-cards";

/**
 * Props for the DeliverablesClient component
 * @property deliverables - Array of all deliverables
 * @property phases - Array of project phases for filtering
 * @property evidenceByDeliverableId - Map of deliverable IDs to their evidence arrays
 */
type DeliverablesClientProps = {
  deliverables: Deliverable[];
  phases: Phase[];
  evidenceByDeliverableId: Record<string, Evidence[]>;
};

export function DeliverablesClient({
  deliverables,
  phases,
  evidenceByDeliverableId,
}: DeliverablesClientProps) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [requestChangesId, setRequestChangesId] = useState<string | null>(null);
  const [requestComment, setRequestComment] = useState("");
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<
    string | null
  >(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isPending, startTransition] = useTransition();

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

  const approve = (deliverableId: string) => {
    startTransition(async () => {
      const result = await approveDeliverableAction({ deliverableId });
      if (result.success) {
        toast.success("Deliverable approved");
        return;
      }
      toast.error(result.error ?? "Failed to approve deliverable");
    });
  };

  const openRequestChanges = (deliverableId: string) => {
    setRequestChangesId(deliverableId);
    setRequestComment("");
  };

  const submitRequestChanges = () => {
    if (!requestChangesId) {
      return;
    }

    startTransition(async () => {
      const result = await requestChangesDeliverableAction({
        deliverableId: requestChangesId,
        comment: requestComment,
      });

      if (result.success) {
        toast.success("Requested changes");
        setRequestChangesId(null);
        setRequestComment("");
        return;
      }

      toast.error(result.error ?? "Failed to request changes");
    });
  };

  return (
    <div className="space-y-8">
      <DeliverablesSummaryCards deliverables={deliverables} summary={summary} />

      <DeliverablesFilters
        onPhaseFilterChange={setPhaseFilter}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        onViewModeChange={setViewMode}
        phaseFilter={phaseFilter}
        phases={phases}
        query={query}
        statusFilter={statusFilter}
        viewMode={viewMode}
      />

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground text-sm">
          No deliverables found.
        </div>
      ) : (
        <section
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "grid grid-cols-1 gap-4"
          )}
        >
          {filtered.map((deliverable) => {
            const phase = phaseById[deliverable.phaseId];
            const evidence = evidenceByDeliverableId[deliverable.id] ?? [];
            return (
              <DeliverableCard
                deliverable={deliverable}
                evidenceCount={evidence.length}
                isPending={isPending}
                key={deliverable.id}
                onApprove={() => approve(deliverable.id)}
                onCardClick={() => setSelectedDeliverableId(deliverable.id)}
                onRequestChanges={() => openRequestChanges(deliverable.id)}
                onViewEvidence={() => setSelectedDeliverableId(deliverable.id)}
                phase={phase}
              />
            );
          })}
        </section>
      )}

      <RequestChangesDialog
        comment={requestComment}
        isPending={isPending}
        onCommentChange={setRequestComment}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setRequestChangesId(null);
            setRequestComment("");
          }
        }}
        onSubmit={submitRequestChanges}
        open={requestChangesId !== null}
      />

      {selectedDeliverableId ? (
        <DeliverableDetails
          deliverable={
            deliverables.find(
              (d) => d.id === selectedDeliverableId
            ) as Deliverable
          }
          evidence={evidenceByDeliverableId[selectedDeliverableId] ?? []}
          evidenceCount={
            (evidenceByDeliverableId[selectedDeliverableId] ?? []).length
          }
          isPending={isPending}
          key={selectedDeliverableId}
          onApprove={() => approve(selectedDeliverableId)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDeliverableId(null);
            }
          }}
          onRequestChanges={() => {
            openRequestChanges(selectedDeliverableId);
            setSelectedDeliverableId(null);
          }}
          onViewEvidence={() => {
            // Handled by evidence display in sheet
          }}
          open={selectedDeliverableId !== null}
          phase={
            phaseById[
              deliverables.find((d) => d.id === selectedDeliverableId)
                ?.phaseId ?? ""
            ]
          }
        />
      ) : null}
    </div>
  );
}
