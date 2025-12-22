"use client";

import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateOnTimePercentage } from "@/lib/helpers/meeting-analytics";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";

type OnTimeCardProps = {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
};

/**
 * OnTimeCard Component
 *
 * Displays the percentage of meetings documented on or before their sprint/phase end date
 * A meeting is on-time if its createdAt (upload date) <= sprint/phase endDate
 *
 * @param logs - Array of all meeting logs
 * @param sprints - Array of all sprints
 * @param phases - Array of all phases
 */
export default function OnTimeCard({ logs, sprints, phases }: OnTimeCardProps) {
  const onTime = calculateOnTimePercentage(logs, sprints, phases);

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <dt className="font-medium text-muted-foreground text-sm">
              On-Time %
            </dt>
            <dd className="mt-2 font-bold text-3xl text-foreground">
              {onTime.percentage}%
            </dd>
            <div className="mt-3 space-y-2">
              <Progress className="h-2" value={onTime.percentage} />
              <p className="text-muted-foreground text-xs">
                {onTime.onTime} of {onTime.total} documented on time
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900">
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
