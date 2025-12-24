/**
 * Project Health Card
 * Displays overall project completion with progress visualization
 */
"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { FramePanel } from "@/components/ui/frame";
import { Tracker } from "@/components/ui/tracker";
import type { ProjectCompletion } from "@/lib/helpers/dashboard-computations";
import { cn } from "@/lib/utils";

type ProjectHealthCardProps = {
  completion: ProjectCompletion;
  targetPercentage?: number;
};

export function ProjectHealthCard({
  completion,
  targetPercentage,
}: ProjectHealthCardProps) {
  const trend = completion.isOnTrack ? "up" : "down";

  const determineStatusText = (): string => {
    if (completion.isOnTrack) {
      return "On Track";
    }
    return targetPercentage ? "Behind Target" : "In Progress";
  };
  const statusText = determineStatusText();

  // Generate tracker blocks for each deliverable
  const trackerData = [
    // Completed deliverables (chart-2 - green)
    ...Array.from({ length: completion.completedDeliverables }, (_, i) => ({
      key: `completed-${i}`,
      color: "bg-emerald-500",
      tooltip: "Completed",
    })),
    // In progress deliverables (primary - blue)
    ...Array.from({ length: completion.inProgressDeliverables }, (_, i) => ({
      key: `progress-${i}`,
      color: "bg-primary",
      tooltip: "In Progress",
    })),
    // In review deliverables (chart-5 - orange)
    ...Array.from({ length: completion.reviewDeliverables }, (_, i) => ({
      key: `review-${i}`,
      color: "bg-purple-500",
      tooltip: "In Review",
    })),
    // Not started (muted)
    ...Array.from(
      {
        length: Math.max(
          0,
          completion.totalDeliverables -
            completion.completedDeliverables -
            completion.inProgressDeliverables -
            completion.reviewDeliverables
        ),
      },
      (_, i) => ({
        key: `pending-${i}`,
        color: "bg-accent",
        tooltip: "Not Started",
      })
    ),
  ];

  return (
    <FramePanel className="space-y-2 p-6 sm:space-y-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-end gap-2">
          <div className="font-bold font-sora text-5xl tabular-nums">
            {completion.overallPercentage}
            <span className="text-3xl text-muted-foreground">%</span>
          </div>
          {targetPercentage ? (
            <div
              className={cn(
                "flex items-center gap-1 text-sm",
                trend === "up" ? "text-chart-2" : "text-destructive"
              )}
            >
              {trend === "up" ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              {Math.abs(completion.overallPercentage - targetPercentage)}% from
              target
            </div>
          ) : null}
        </div>
        <div className="space-y-0">
          <p
            className={cn(
              "font-semibold text-base",
              trend === "up" ? "text-chart-2" : "text-muted-foreground"
            )}
          >
            {statusText}
          </p>
          {completion.activePhaseEndDate ? (
            <p className="mt-2 text-sm">
              Target: {targetPercentage}% by{" "}
              {new Date(completion.activePhaseEndDate).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                }
              )}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium">
              {completion.totalDeliverables} deliverables
            </span>
          </div>
          <Tracker className="h-4" data={trackerData} />
        </div>
      </div>
    </FramePanel>
  );
}
