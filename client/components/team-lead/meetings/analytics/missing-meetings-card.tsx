"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { MeetingLog, Sprint, Phase } from "@/lib/types";
import { calculateMissingMeetings } from "@/lib/helpers/meeting-analytics";
import { AlertCircle } from "lucide-react";

interface MissingMeetingsCardProps {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
}

/**
 * MissingMeetingsCard Component
 *
 * Displays the count of valid sprints/phases that do NOT have documented meetings
 * This helps identify documentation gaps that need attention
 *
 * @param logs - Array of all meeting logs
 * @param sprints - Array of all sprints
 * @param phases - Array of all phases
 */
export default function MissingMeetingsCard({
  logs,
  sprints,
  phases,
}: MissingMeetingsCardProps) {
  const missing = calculateMissingMeetings(logs, sprints, phases);

  const isAlert = missing.count > 0;

  return (
    <Card className={`py-4 ${isAlert ? "border-red-200 dark:border-red-800" : ""}`}>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Missing Meetings
            </dt>
            <dd
              className={`text-3xl font-bold mt-2 ${
                isAlert ? "text-red-600 dark:text-red-400" : "text-foreground"
              }`}
            >
              {missing.count}
            </dd>
            <p className="text-xs text-muted-foreground mt-2">
              {missing.sprints.length > 0 && (
                <>
                  {missing.sprints.length} sprint{missing.sprints.length !== 1 ? "s" : ""}
                  {missing.phases.length > 0 && " and "}
                </>
              )}
              {missing.phases.length > 0 && (
                <>
                  {missing.phases.length} phase{missing.phases.length !== 1 ? "s" : ""}
                </>
              )}
              {missing.count > 0 && " without meetings"}
            </p>
          </div>
          <div
            className={`p-3 rounded-lg ${
              isAlert
                ? "bg-red-100 dark:bg-red-900"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <AlertCircle
              className={`h-6 w-6 ${
                isAlert
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
