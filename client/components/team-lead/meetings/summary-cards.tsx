"use client";

import type { MeetingLog, Sprint, Phase } from "@/lib/types";
import {
	TotalMeetingsCard,
	CoverageCard,
	OnTimeCard,
	MissingMeetingsCard,
} from "./analytics";

interface SummaryCardsRowProps {
	logs: MeetingLog[];
	sprints: Sprint[];
	phases: Phase[];
}

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
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<TotalMeetingsCard logs={logs} />
			<CoverageCard logs={logs} sprints={sprints} phases={phases} />
			<OnTimeCard logs={logs} sprints={sprints} phases={phases} />
			<MissingMeetingsCard logs={logs} sprints={sprints} phases={phases} />
		</div>
	);
}