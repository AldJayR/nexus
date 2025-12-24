/**
 * Phase Progress Cards
 * Displays WSF phases with completion status
 */
"use client";

import { Droplet, RefreshCw, Rocket } from "lucide-react";
import { CategoryBar } from "@/components/ui/category-bar";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status";
import type { PhaseProgress } from "@/lib/helpers/dashboard-computations";
import type { DeliverableStatus, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const PHASE_ICONS = {
  WATERFALL: Droplet,
  SCRUM: RefreshCw,
  FALL: Rocket,
} as const;

// Map phase status to deliverable status enum, with actual work as fallback
function mapPhaseStatusToEnum(
  status: "Completed" | "Active" | "Pending" | "At Risk",
  completionPercentage: number,
  inProgressCount: number
): DeliverableStatus | TaskStatus {
  // Check actual work first
  if (completionPercentage === 100) {
    return "COMPLETED";
  }
  if (completionPercentage > 0 || inProgressCount > 0) {
    return "IN_PROGRESS";
  }

  // Then check status
  switch (status) {
    case "At Risk":
      return "BLOCKED";
    default:
      return "NOT_STARTED";
  }
}

type PhaseProgressCardsProps = {
  phases: PhaseProgress[];
};

export function PhaseProgressCards({ phases }: PhaseProgressCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {phases.map((phase) => {
        const Icon = PHASE_ICONS[phase.type];
        const isActive = phase.status === "Active";

        return (
          <Frame className={cn("relative transition-all")} key={phase.id}>
            <FrameHeader className="flex-row items-center gap-2">
              <div className="rounded-md bg-linear-120 from-primary to-primary/60 p-2 shadow-sm">
                <Icon className="text-white" size={16} />
              </div>
              <FrameTitle className="line-clamp-1 text-sm">
                {phase.name}
              </FrameTitle>
            </FrameHeader>

            <FramePanel
              className={cn(
                "space-y-2",
                isActive ? "border-primary shadow-primary/50" : ""
              )}
            >
              <div className="flex items-center justify-between">
                <StatusBadge
                  status={mapPhaseStatusToEnum(
                    phase.status,
                    phase.completionPercentage,
                    phase.inProgressDeliverables
                  )}
                />
                <span className="font-bold font-sora text-xl tabular-nums">
                  {phase.completionPercentage}%
                </span>
              </div>

              <div className="space-y-2">
                <CategoryBar
                  className="h-2"
                  colors={["emerald", "blue", "violet", "gray"]}
                  showLabels={false}
                  values={[
                    phase.completedDeliverables,
                    phase.inProgressDeliverables,
                    phase.reviewDeliverables,
                    phase.notStartedDeliverables,
                  ]}
                />
                <p className="flex justify-between font-sora text-muted-foreground text-xs">
                  <span>
                    {phase.completedDeliverables} completed,{" "}
                    {phase.inProgressDeliverables} in progress
                  </span>
                  <span>
                    {phase.completedDeliverables + phase.inProgressDeliverables}{" "}
                    / {phase.totalDeliverables}
                  </span>
                </p>
              </div>
            </FramePanel>
          </Frame>
        );
      })}
    </div>
  );
}
