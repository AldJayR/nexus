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
  targetDate?: string;
};

export function ProjectHealthCard({
  completion,
  targetPercentage,
  targetDate,
}: ProjectHealthCardProps) {
  const trend =
    targetPercentage && completion.overallPercentage >= targetPercentage
      ? "up"
      : "down";

  const statusText =
    trend === "up"
      ? "On Track"
      : targetPercentage
        ? "Behind Target"
        : "In Progress";

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
    <FramePanel className="p-6">
      <div className="flex flex-col gap-4 font-sora sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-end gap-2">
          <div className="font-bold text-5xl tabular-nums">
            {completion.overallPercentage}
            <span className="text-3xl text-muted-foreground">%</span>
          </div>
          {targetPercentage && (
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
          )}
        </div>
        <div className="space-y-1">
          <p
            className={cn(
              "font-semibold text-base",
              trend === "up" ? "text-chart-2" : "text-muted-foreground"
            )}
          >
            {statusText}
          </p>
          {targetDate && (
            <p className="text-sm">
              Target: {targetPercentage}% by{" "}
              {new Date(targetDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
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
