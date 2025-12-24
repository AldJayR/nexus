/**
 * Sprint Health Card
 * Displays current sprint metrics with burndown visualization
 */
"use client";

import { AlertTriangle, Calendar, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryBar } from "@/components/ui/category-bar";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Tracker } from "@/components/ui/tracker";
import type { SprintHealth } from "@/lib/helpers/dashboard-computations";
import type { Task } from "@/lib/types";

type SprintHealthCardProps = {
  sprint: SprintHealth;
  tasks?: Task[];
};

export function SprintHealthCard({
  sprint,
  tasks = [],
}: SprintHealthCardProps) {
  const isOverdue = sprint.daysRemaining < 0;
  const isNearEnd = sprint.daysRemaining <= 3 && sprint.daysRemaining >= 0;
  const hasBlockedTasks = sprint.blockedTasks > 0;

  // Generate tracker data from actual tasks with titles in tooltips
  const trackerData = tasks.map((task) => {
    let color = "bg-accent"; // default: todo
    if (task.status === "DONE") {
      color = "bg-emerald-500";
    } else if (task.status === "IN_PROGRESS") {
      color = "bg-primary";
    } else if (task.status === "BLOCKED") {
      color = "bg-destructive";
    }

    return {
      key: task.id,
      color,
      tooltip:
        task.title.length > 30 ? `${task.title.slice(0, 30)}...` : task.title,
    };
  });

  return (
    <Frame className="relative h-full transition-all">
      <FrameHeader className="flex-row items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-linear-120 from-primary to-primary/60 p-2 shadow-sm">
            <Target className="size-4 text-white" />
          </div>
          <div className="space-y-0">
            <FrameTitle className="text-sm">
              Sprint <span className="font-sora">{sprint.number}</span>
            </FrameTitle>
            <FrameDescription className="line-clamp-1 text-xs">
              {sprint.goal || "No goal set"}
            </FrameDescription>
          </div>
        </div>
        {(() => {
          const getBadgeVariant = ():
            | "destructive"
            | "secondary"
            | "outline" => {
            if (isOverdue) {
              return "destructive";
            }
            if (isNearEnd) {
              return "secondary";
            }
            return "outline";
          };

          const getBadgeText = (): string => {
            if (isOverdue) {
              return `${Math.abs(sprint.daysRemaining)}d overdue`;
            }
            if (isNearEnd) {
              return `${sprint.daysRemaining}d left`;
            }
            return `${sprint.daysRemaining}d remaining`;
          };

          return <Badge variant={getBadgeVariant()}>{getBadgeText()}</Badge>;
        })()}
      </FrameHeader>

      <FramePanel className="space-y-6">
        {/* Blocked Tasks Alert */}
        {hasBlockedTasks ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <AlertTriangle className="size-4 text-destructive" />
            <p className="text-sm">
              <span className="font-semibold text-destructive">
                {sprint.blockedTasks} blocked task
                {sprint.blockedTasks !== 1 ? "s" : ""}
              </span>{" "}
              <span className="text-muted-foreground">
                require immediate attention
              </span>
            </p>
          </div>
        ) : null}

        {/* Task Tracker Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Task Distribution</span>
            <span className="font-medium text-xs tabular-nums">
              {sprint.totalTasks} total
            </span>
          </div>
          <Tracker className="h-4" data={trackerData} showTooltip />
        </div>

        {/* Sprint Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sprint Progress</span>
            <span className="font-bold tabular-nums">
              {sprint.completionPercentage}%
            </span>
          </div>
          <CategoryBar
            className="h-2"
            colors={["emerald", "blue", "destructive", "gray"]}
            showLabels={false}
            values={[
              sprint.doneTasks,
              sprint.inProgressTasks,
              sprint.blockedTasks,
              sprint.todoTasks,
            ]}
          />
          <p className="flex justify-between font-sora text-muted-foreground text-xs">
            <span>
              {sprint.doneTasks} done, {sprint.inProgressTasks} in progress
            </span>
            <span>
              {sprint.doneTasks + sprint.inProgressTasks} / {sprint.totalTasks}
            </span>
          </p>
        </div>

        {/* Sprint Timeline */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Sprint Period</span>
          </div>
          <span className="font-medium text-xs">
            {new Date(sprint.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(sprint.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </FramePanel>
    </Frame>
  );
}
