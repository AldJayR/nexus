/**
 * Phase Progress Cards
 * Displays WSF phases with completion status
 */
"use client";

import { Droplet, RefreshCw, Rocket } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status";
import type { PhaseProgress } from "@/lib/helpers/dashboard-computations";
import type { DeliverableStatus, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const PHASE_ICONS = {
  WATERFALL: Droplet,
  SCRUM: RefreshCw,
  FALL: Rocket,
} as const;

// Map phase status to enum status for StatusBadge
function mapPhaseStatusToEnum(
  status: "Completed" | "Active" | "Pending" | "At Risk"
): DeliverableStatus | TaskStatus {
  switch (status) {
    case "Completed":
      return "COMPLETED";
    case "Active":
      return "IN_PROGRESS";
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
                <StatusBadge status={mapPhaseStatusToEnum(phase.status)} />
                <span className="font-bold font-sora text-xl tabular-nums">
                  {phase.completionPercentage}%
                </span>
              </div>

              <div className="space-y-2">
                <Progress value={phase.completionPercentage} />
                <p className="flex justify-between font-sora text-muted-foreground text-xs">
                  {phase.completedDeliverables} / {phase.totalDeliverables}{" "}
                  completed
                </p>
              </div>
            </FramePanel>
          </Frame>
        );
      })}
    </div>
  );
}
