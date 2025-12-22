"use client";

import type { Table } from "@tanstack/react-table";
import type { Phase, Sprint } from "@/lib/types";
import { UploadMinutesButton } from "../upload-button";
import type { MeetingsTableRow } from "./columns";
import { MeetingsFilters } from "./filter";

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
        scopeCounts={scopeCounts}
        table={table}
        uniqueScopeValues={uniqueScopeValues}
      />
      <UploadMinutesButton phases={phases} sprints={sprints} />
    </div>
  );
}
