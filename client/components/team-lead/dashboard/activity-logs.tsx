/**
 * Activity Feed
 * Recent actions and notifications
 */
"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileUp,
  Logs,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { formatTitleCase } from "@/lib/helpers/format-title-case";
import type { ActivityLog } from "@/lib/types";

type ActivityFeedProps = {
  activities: ActivityLog[];
  limit?: number;
};

const ACTION_CONFIG: Record<
  string,
  {
    icon: typeof CheckCircle2;
    bg: string;
    color: string;
    label: string;
  }
> = {
  DELIVERABLE_APPROVED: {
    icon: CheckCircle2,
    bg: "bg-chart-2/10",
    color: "text-chart-2",
    label: "Approved",
  },
  DELIVERABLE_REJECTED: {
    icon: AlertCircle,
    bg: "bg-destructive/10",
    color: "text-destructive",
    label: "Changes Requested",
  },
  EVIDENCE_UPLOADED: {
    icon: FileUp,
    bg: "bg-primary/10",
    color: "text-primary",
    label: "Evidence Uploaded",
  },
  TASK_BLOCKED: {
    icon: AlertCircle,
    bg: "bg-destructive/10",
    color: "text-destructive",
    label: "Task Blocked",
  },
  TASK_COMPLETED: {
    icon: CheckCircle2,
    bg: "bg-chart-2/10",
    color: "text-chart-2",
    label: "Task Completed",
  },
  COMMENT_ADDED: {
    icon: MessageSquare,
    bg: "bg-chart-5/10",
    color: "text-chart-5",
    label: "Comment Added",
  },
};

const DEFAULT_CONFIG = {
  icon: Clock,
  bg: "bg-muted",
  color: "text-muted-foreground",
  label: "Activity",
};

export function ActivityLogs({ activities, limit = 3 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(-limit).reverse();

  if (displayedActivities.length === 0) {
    return (
      <Card>
        <CardHeader className="border-border border-b">
          <CardTitle className="text-lg">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 font-medium text-muted-foreground text-sm">
            No recent activity
          </p>
          <p className="text-muted-foreground text-xs">
            Activity will appear here as team members work
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Frame>
      <FrameHeader className="flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-linear-120 from-blue-500 to-blue-400 p-2 shadow-sm dark:from-blue-800 dark:to-blue-700">
            <Logs className="size-4 text-white" />
          </div>
          <FrameTitle className="text-sm">Activity Logs</FrameTitle>
        </div>
        <Button asChild variant="outline">
          <Link href="/settings/activity-logs">View All</Link>
        </Button>
      </FrameHeader>
      <FramePanel>
        {displayedActivities.map((activity) => {
          const config = ACTION_CONFIG[activity.action] || DEFAULT_CONFIG;

          // Format action name using title case helper
          const actionLabel = formatTitleCase(activity.action);

          return (
            <div
              className="flex items-center justify-between gap-4 py-2"
              key={activity.id}
            >
              <p className="font-medium text-sm leading-tight *:text-muted-foreground *:text-xs">
                {actionLabel}{" "}
                {activity.user && <span>by {activity.user.name}</span>}{" "}
                <span>
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </p>
              <Badge className="shrink-0 text-[10px]" variant="outline">
                {config.label}
              </Badge>
            </div>
          );
        })}
      </FramePanel>
    </Frame>
  );
}
