"use client";

import { Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
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
    <Frame className="relative transition-all duration-300">
      {/* Current Phase Badge */}
      {/* {isActive ? (
        <Badge className="absolute top-0 -translate-x-1/2 -translate-y-1/2 rounded-full left-1/2">
          Current Phase
        </Badge>
      ) : null} */}

      {/* Card Header */}
      <FrameHeader className="space-y-2 p-4">
        <div className="flex justify-between gap-2">
          <div className="flex-1">
            <FrameTitle className="font-bold text-foreground text-sm">
              {phase.name}
            </FrameTitle>
            {phase.startDate && phase.endDate ? (
              <FrameDescription
                className={cn(
                  "text-muted-foreground text-xs",
                  isLessThanWeekRemaining(phase.endDate) && "text-destructive"
                )}
              >
                {formatDate(phase.startDate)} to {formatDate(phase.endDate)}{" "}
                {progress != 100
                  ? `(${calculateDaysBetween(phase.startDate, phase.endDate)} days)`
                  : null}
              </FrameDescription>
            ) : null}
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onEditPhase(phase);
            }}
            size="icon"
            title="Edit Phase"
            variant="ghost"
          >
            <Edit size={16} />
          </Button>
        </div>
        {/* Progress Bar - Only for Active Phase */}
        {isActive ? (
          <div className="flex items-center gap-2">
            <p className="font-medium font-sora">{progress}%</p>
            <Progress className="h-2" value={progress} />
          </div>
        ) : null}
      </FrameHeader>

      {/* Card Content */}
      <FramePanel className={cn("h-fit p-2", isActive ? "border-primary" : "border-border")}>
        {/* Deliverables List */}
        {totalDeliverables === 0 ? (
          <p className="text-muted-foreground text-xs">No deliverables</p>
        ) : (
          <DeliverableItem
            deliverables={phase.deliverables}
            onEdit={onEditDeliverable}
          />
        )}
      </FramePanel>
      <FrameFooter className="mt-auto">
        {/* Add Deliverable Button */}
        <Button
          className="w-full"
          onClick={() => onAddDeliverable(phase.id)}
          variant={isActive ? "default" : "outline"}
        >
          <Plus className="size-4" />
          Add Deliverable
        </Button>
      </FrameFooter>
    </Frame>
  );
}
