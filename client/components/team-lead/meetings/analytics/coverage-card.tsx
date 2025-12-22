"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MeetingLog, Sprint, Phase } from "@/lib/types";
import { calculateCoveragePercentage } from "@/lib/helpers/meeting-analytics";
import { CheckCircle2 } from "lucide-react";

interface CoverageCardProps {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
}

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
            <dt className="text-sm font-medium text-muted-foreground">
              Coverage
            </dt>
            <dd className="text-3xl font-bold text-foreground mt-2">
              {coverage.percentage}%
            </dd>
            <div className="mt-3 space-y-2">
              <Progress value={coverage.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {coverage.covered} of {coverage.total} sprints/phases documented
              </p>
            </div>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
