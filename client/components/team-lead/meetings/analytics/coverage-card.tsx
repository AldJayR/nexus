"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateCoveragePercentage } from "@/lib/helpers/meeting-analytics";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";

type CoverageCardProps = {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
};

/**
 * CoverageCard Component
 *
 * Displays the percentage of valid sprints/phases that have documented meetings
 * Valid sprints/phases = have both startDate and endDate (and not soft-deleted for sprints)
 *
 * @param logs - Array of all meeting logs
 * @param sprints - Array of all sprints
 * @param phases - Array of all phases
 */
export default function CoverageCard({
  logs,
  sprints,
  phases,
}: CoverageCardProps) {
  const coverage = calculateCoveragePercentage(logs, sprints, phases);

  return (
    <Card className="py-4">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <dt className="font-medium text-muted-foreground text-sm">
              Coverage
            </dt>
            <dd className="mt-2 font-bold text-3xl text-foreground">
              {coverage.percentage}%
            </dd>
            <div className="mt-3 space-y-2">
              <Progress className="h-2" value={coverage.percentage} />
              <p className="text-muted-foreground text-xs">
                {coverage.covered} of {coverage.total} sprints/phases documented
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
