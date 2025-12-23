/**
 * Sprint Health Card
 * Displays current sprint metrics with burndown visualization
 */
"use client";

import { AlertTriangle, Calendar, Target } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { Tracker } from "@/components/ui/tracker";
import type { SprintHealth } from "@/lib/helpers/dashboard-computations";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type SprintHealthChartProps = {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  config: ChartConfig;
};

type SprintHealthCardProps = {
  sprint: SprintHealth;
  tasks?: Task[];
  chartData?: Array<{ name: string; value: number; fill: string }>;
};

const chartConfig = {
  value: {
    label: "Tasks",
  },
  week1: {
    label: "Week 1",
    color: "var(--chart-1)",
  },
  week2: {
    label: "Week 2",
    color: "var(--chart-2)",
  },
  week3: {
    label: "Week 3",
    color: "var(--chart-3)",
  },
  week4: {
    label: "Week 4",
    color: "var(--chart-4)",
  },
  week5: {
    label: "Week 5",
    color: "var(--chart-5)",
  },
  week6: {
    label: "Week 6",
    color: "var(--chart-1)",
  },
  week7: {
    label: "Week 7",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

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
    <Frame className="relative h-fit transition-all">
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
        <Badge
          variant={
            isOverdue ? "destructive" : isNearEnd ? "secondary" : "outline"
          }
        >
          {isOverdue
            ? `${Math.abs(sprint.daysRemaining)}d overdue`
            : isNearEnd
              ? `${sprint.daysRemaining}d left`
              : `${sprint.daysRemaining}d remaining`}
        </Badge>
      </FrameHeader>

      <FramePanel className="space-y-6">
        {/* Blocked Tasks Alert */}
        {hasBlockedTasks && (
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
        )}

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
          <Progress
            // className="h-3"
            className={cn(
              "transition-all duration-500",
              sprint.completionPercentage >= 75
                ? "bg-emerald-500"
                : sprint.completionPercentage >= 50
                  ? "bg-primary"
                  : sprint.completionPercentage >= 25
                    ? "bg-chart-5"
                    : "bg-primary/20"
            )}
            value={sprint.completionPercentage}
          />
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

function _SprintHealthChart({ data }: SprintHealthChartProps) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={data} height={150}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="name"
          tick={{ fontSize: 12 }}
          tickLine={false}
          tickMargin={10}
        />
        <ChartTooltip
          content={<ChartTooltipContent hideLabel />}
          cursor={false}
        />
        <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
