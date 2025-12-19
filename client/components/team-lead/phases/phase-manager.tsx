"use client";

import { Settings } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header Section - Matching code.html structure but using components */}
      <header className="mb-2 flex w-full flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="font-black text-3xl text-foreground leading-tight tracking-[-0.033em] md:text-4xl">
            Project Phases
          </h1>
          <p className="font-normal text-base text-muted-foreground leading-normal">
            Manage the Water-Scrum-Fall lifecycle and track deliverables.
          </p>
        </div>
        <Button className="gap-2" variant="secondary">
          <Settings className="h-5 w-5" />
          <span>Project Settings</span>
        </Button>
      </header>

      {/* Phases List */}
      <div className="flex flex-col gap-6">
        {phases.map((phase) => (
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
