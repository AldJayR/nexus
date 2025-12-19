"use client";

import { useState } from "react";

import type { Deliverable, PhaseDetail } from "@/lib/types";

import { DeliverableDialog } from "./deliverable-dialog";
import { PhaseCard } from "./phase-card";
import { PhaseDialog } from "./phase-dialog";

type PhaseManagerProps = {
  phases: PhaseDetail[];
};

export function PhaseManager({ phases }: PhaseManagerProps) {
  const [editingPhase, setEditingPhase] = useState<PhaseDetail | null>(null);
  const [addingDeliverablePhaseId, setAddingDeliverablePhaseId] = useState<
    string | null
  >(null);
  const [editingDeliverable, setEditingDeliverable] =
    useState<Deliverable | null>(null);

  // Sort phases in WSF order (Waterfall → Scrum → Fall)
  const phaseOrder = ["WATERFALL", "SCRUM", "FALL"];
  const sortedPhases = [...phases].sort(
    (a, b) => phaseOrder.indexOf(a.type) - phaseOrder.indexOf(b.type)
  );

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Phases List */}
      <div className="grid grid-cols-3 gap-4">
        {sortedPhases.map((phase) => (
          <PhaseCard
            key={phase.id}
            onAddDeliverable={setAddingDeliverablePhaseId}
            onEditDeliverable={setEditingDeliverable}
            onEditPhase={setEditingPhase}
            phase={phase}
          />
        ))}
      </div>

      {/* Dialogs */}
      <PhaseDialog
        onOpenChange={(open) => !open && setEditingPhase(null)}
        open={!!editingPhase}
        phase={editingPhase}
      />

      <DeliverableDialog
        deliverable={editingDeliverable}
        onOpenChange={(open) => {
          if (!open) {
            setAddingDeliverablePhaseId(null);
            setEditingDeliverable(null);
          }
        }}
        open={!!addingDeliverablePhaseId || !!editingDeliverable}
        phaseId={
          addingDeliverablePhaseId || (editingDeliverable?.phaseId ?? null)
        }
      />
    </div>
  );
}
