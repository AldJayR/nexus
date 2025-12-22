"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { calculateMissingMeetings } from "@/lib/helpers/meeting-analytics";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";

type MissingMeetingsCardProps = {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
};

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
    <Card
      className={`py-4 ${isAlert ? "border-red-200 dark:border-red-800" : ""}`}
    >
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <dt className="font-medium text-muted-foreground text-sm">
              Missing Meetings
            </dt>
            <dd
              className={`mt-2 font-bold text-3xl ${
                isAlert ? "text-red-600 dark:text-red-400" : "text-foreground"
              }`}
            >
              {missing.count}
            </dd>
            <p className="mt-2 text-muted-foreground text-xs">
              {missing.sprints.length > 0 && (
                <>
                  {missing.sprints.length} sprint
                  {missing.sprints.length !== 1 ? "s" : ""}
                  {missing.phases.length > 0 && " and "}
                </>
              )}
              {missing.phases.length > 0 && (
                <>
                  {missing.phases.length} phase
                  {missing.phases.length !== 1 ? "s" : ""}
                </>
              )}
              {missing.count > 0 && " without meetings"}
            </p>
          </div>
          <div
            className={`rounded-lg p-3 ${
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
