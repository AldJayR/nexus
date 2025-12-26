"use client";

import { Suspense } from "react";
import FrameSkeleton from "@/components/shared/frame-skeleton";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";
import {
  CoverageCard,
  MissingMeetingsCard,
  OnTimeCard,
  TotalMeetingsCard,
} from "./analytics";

type SummaryCardsRowProps = {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
};

/**
 * SummaryCardsRow Component
 *
 * Displays all four summary cards in a responsive grid
 * - Total Meetings: Count of all documented meetings
 * - Coverage %: Percentage of sprints/phases with documented meetings
 * - On-Time %: Percentage of meetings documented before sprint/phase end date
 * - Missing Meetings: Count of sprints/phases without documented meetings
 *
 * @param logs - Array of all meeting logs
 * @param sprints - Array of all sprints
 * @param phases - Array of all phases
 */
export default function SummaryCardsRow({
  logs,
  sprints,
  phases,
}: SummaryCardsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Suspense fallback={<FrameSkeleton />}>
        <TotalMeetingsCard logs={logs} />
      </Suspense>
      <Suspense fallback={<FrameSkeleton />}>
        <CoverageCard logs={logs} phases={phases} sprints={sprints} />
      </Suspense>
      <Suspense fallback={<FrameSkeleton />}>
        <OnTimeCard logs={logs} phases={phases} sprints={sprints} />
      </Suspense>
      <Suspense fallback={<FrameSkeleton />}>
        <MissingMeetingsCard logs={logs} phases={phases} sprints={sprints} />
      </Suspense>
    </div>
  );
}
