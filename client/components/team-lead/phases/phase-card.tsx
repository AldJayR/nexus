"use client";

import { ChevronDown, Edit, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import {
  type Deliverable,
  DeliverableStatus,
  type PhaseDetail,
} from "@/lib/types";

import { DeliverableTable } from "./deliverable-table";

type PhaseCardProps = {
  phase: PhaseDetail;
  onEditPhase: (phase: PhaseDetail) => void;
  onAddDeliverable: (phaseId: string) => void;
  onEditDeliverable: (deliverable: Deliverable) => void;
};

export function PhaseCard({
  phase,
  onEditPhase,
  onAddDeliverable,
  onEditDeliverable,
}: PhaseCardProps) {
  const totalDeliverables = phase.deliverables.length;
  const completedDeliverables = phase.deliverables.filter(
    (d) => d.status === DeliverableStatus.COMPLETED
  ).length;
  const progress =
    totalDeliverables > 0
      ? Math.round((completedDeliverables / totalDeliverables) * 100)
      : 0;

  const isActive =
    phase.startDate &&
    phase.endDate &&
    new Date() >= new Date(phase.startDate) &&
    new Date() <= new Date(phase.endDate);

  const isCompleted =
    phase.endDate && new Date() > new Date(phase.endDate) && progress === 100;

  return (
    <details className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 open:bg-card">
      <summary className="flex cursor-pointer list-none flex-col p-6 transition-colors hover:bg-muted/50">
        <div className="mb-4 flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-foreground text-xl">{phase.name}</h2>
            {phase.startDate && phase.endDate ? (
              <span className="hidden rounded-full border border-border bg-muted px-2.5 py-0.5 font-medium text-muted-foreground text-xs sm:inline-flex">
                {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              if (isCompleted) {
                return (
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300">
                    Completed
                  </span>
                );
              }
              if (isActive) {
                return (
                  <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 font-medium text-green-800 text-xs dark:border-green-800/50 dark:bg-green-900/30 dark:text-green-300">
                    Active
                  </span>
                );
              }

              return (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 font-medium text-slate-800 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Pending
                </span>
              );
            })()}

            <Button
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.preventDefault();
                onEditPhase(phase);
              }}
              size="icon"
              title="Edit Phase"
              variant="ghost"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <div className="flex items-center text-muted-foreground transition-transform duration-200 group-open:rotate-180">
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex w-full items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-12 text-right font-medium text-muted-foreground text-sm">
            {progress}%
          </span>
        </div>
      </summary>

      {/* Expanded Content */}
      <div className="border-border border-t px-6 pt-2 pb-6">
        <div className="mt-2 mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
            Deliverables
          </h3>
          <Button onClick={() => onAddDeliverable(phase.id)}>
            <Plus className="size-4" />
            Add Deliverable
          </Button>
        </div>

        <DeliverableTable
          deliverables={phase.deliverables}
          onEdit={onEditDeliverable}
        />
      </div>
    </details>
  );
}
