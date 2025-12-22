"use client";

import { Edit, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calculateDaysBetween,
  formatDate,
  isLessThanWeekRemaining,
} from "@/lib/helpers/format-date";
import {
  type Deliverable,
  DeliverableStatus,
  type PhaseDetail,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { DeliverableItem } from "./deliverable-item";

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

  const _isPending = phase.startDate && new Date() < new Date(phase.startDate);

  const _isCompleted =
    phase.endDate && new Date() > new Date(phase.endDate) && progress === 100;

  return (
    <div
      className={`relative flex h-full flex-col rounded-xl border-2 bg-card transition-all duration-300 ${
        isActive ? "border-primary" : "border-border"
      }`}
    >
      {/* Current Phase Badge */}
      {isActive ? (
        <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full">
          Current Phase
        </Badge>
      ) : null}

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 border-border border-b px-4 pt-5 pb-3">
        <div className="flex-1">
          <h2 className="font-bold text-foreground text-lg">{phase.name}</h2>
          {phase.startDate && phase.endDate ? (
            <p
              className={cn(
                "mt-1 text-muted-foreground text-xs",
                isLessThanWeekRemaining(phase.endDate) && "text-destructive"
              )}
            >
              {formatDate(phase.startDate)} to {formatDate(phase.endDate)}{" "}
              {`(${calculateDaysBetween(phase.startDate, phase.endDate)} days)`}
            </p>
          ) : null}
        </div>
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
      </div>

      {/* Progress Bar - Only for Active Phase */}
      {isActive ? (
        <div className="flex items-center gap-3 border-border border-b px-4 py-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-12 text-right font-medium text-muted-foreground text-xs">
            {progress}%
          </span>
        </div>
      ) : null}

      {/* Card Content */}
      <div className="flex flex-1 flex-col px-4 py-4">
        {/* <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-3">
          Deliverables ({totalDeliverables})
        </h3> */}

        {/* Deliverables List */}
        <div className="mb-4 flex-1">
          {totalDeliverables === 0 ? (
            <p className="text-muted-foreground text-xs">No deliverables</p>
          ) : (
            <DeliverableItem
              deliverables={phase.deliverables}
              onEdit={onEditDeliverable}
            />
          )}
        </div>

        {/* Add Deliverable Button */}
        <Button
          className="mt-auto w-full"
          onClick={() => onAddDeliverable(phase.id)}
          variant={isActive ? "default" : "outline"}
        >
          <Plus className="size-4" />
          Add Deliverable
        </Button>
      </div>
    </div>
  );
}
