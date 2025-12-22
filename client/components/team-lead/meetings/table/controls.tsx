"use client";

import type { Table } from "@tanstack/react-table";
import { UploadMinutesButton } from "../upload-button";
import { MeetingsFilters } from "./filter";
import type { MeetingsTableRow } from "./columns";
import type { Phase, Sprint } from "@/lib/types";

type MeetingsTableControlsProps = {
	table: Table<MeetingsTableRow>;
	uniqueScopeValues: string[];
	scopeCounts: Map<string, number>;
	sprints: Sprint[];
	phases: Phase[];
};

export function MeetingsTableControls({
	table,
	uniqueScopeValues,
	scopeCounts,
	sprints,
	phases,
}: MeetingsTableControlsProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<MeetingsFilters
				table={table}
				uniqueScopeValues={uniqueScopeValues}
				scopeCounts={scopeCounts}
			/>
			<UploadMinutesButton phases={phases} sprints={sprints} />
		</div>
	);
}
