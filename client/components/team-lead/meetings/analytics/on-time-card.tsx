"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MeetingLog, Sprint, Phase } from "@/lib/types";
import { calculateOnTimePercentage } from "@/lib/helpers/meeting-analytics";
import { Clock } from "lucide-react";

interface OnTimeCardProps {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
}

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
export default function OnTimeCard({
  logs,
  sprints,
  phases,
}: OnTimeCardProps) {
  const onTime = calculateOnTimePercentage(logs, sprints, phases);

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <dt className="text-sm font-medium text-muted-foreground">
              On-Time %
            </dt>
            <dd className="text-3xl font-bold text-foreground mt-2">
              {onTime.percentage}%
            </dd>
            <div className="mt-3 space-y-2">
              <Progress value={onTime.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {onTime.onTime} of {onTime.total} documented on time
              </p>
            </div>
          </div>
          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
