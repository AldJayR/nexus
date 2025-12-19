"use client";

import { Edit, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { calculateDaysBetween, formatDate, isLessThanWeekRemaining } from "@/lib/helpers/format-date";
import {
  type Deliverable,
  DeliverableStatus,
  type PhaseDetail,
} from "@/lib/types";
import { cn } from "@/lib/utils";

import { DeliverableItem } from "./deliverable-item";
import { Badge } from "@/components/ui/badge";

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

  const isPending =
    phase.startDate && new Date() < new Date(phase.startDate);

  const isCompleted =
    phase.endDate && new Date() > new Date(phase.endDate) && progress === 100;

  return (
    <div className={`relative flex flex-col h-full rounded-xl border-2 transition-all duration-300 bg-card ${
      isActive
        ? "border-primary"
        : "border-border"
    }`}>
      {/* Current Phase Badge */}
      {isActive && (
        <Badge className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 rounded-full">
          Current Phase
        </Badge>
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 border-border border-b px-4 pt-5 pb-3">
        <div className="flex-1">
          <h2 className="font-bold text-foreground text-lg">{phase.name}</h2>
          {phase.startDate && phase.endDate ? (
            <p
              className={cn(
                "text-muted-foreground text-xs mt-1",
                isLessThanWeekRemaining(phase.endDate) && "text-destructive"
              )}
            >
              {formatDate(phase.startDate)} to {formatDate(phase.endDate)} {`(${calculateDaysBetween(phase.startDate, phase.endDate)} days)`}
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
      {isActive && (
        <div className="flex items-center gap-3 px-4 py-3 border-border border-b">
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
      )}

      {/* Card Content */}
      <div className="flex-1 flex flex-col px-4 py-4">
        {/* <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-3">
          Deliverables ({totalDeliverables})
        </h3> */}

        {/* Deliverables List */}
        <div className="flex-1 mb-4">
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
          onClick={() => onAddDeliverable(phase.id)}
          className="w-full mt-auto"
          variant={isActive ? "default" : "outline"}
        >
          <Plus className="size-4" />
          Add Deliverable
        </Button>
      </div>
    </div>
  );
}
