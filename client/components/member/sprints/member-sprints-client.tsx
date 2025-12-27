"use client";

import { useMemo, useState } from "react";

import {
  FilterChips,
  type FilterKey,
} from "@/components/team-lead/sprints/filter-chips";
import { PhaseSection } from "@/components/team-lead/sprints/phase-section";
import { getSprintStatus } from "@/lib/helpers/sprint";
import type { Sprint, SprintProgress } from "@/lib/types";

type MemberSprintsClientProps = {
  sprints: Sprint[];
  progressById: Record<string, SprintProgress | undefined>;
};

export function MemberSprintsClient({
  sprints,
  progressById,
}: MemberSprintsClientProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const now = new Date();

  // Filter sprints by status (all sprints here are already authorized for this user)
  const filtered = useMemo(
    () =>
      sprints.filter((sprint) => {
        if (filter === "all") {
          return true;
        }
        const status = getSprintStatus(sprint, now);
        if (filter === "active") {
          return status === "ACTIVE";
        }
        if (filter === "planned") {
          return status === "PLANNED";
        }
        return status === "COMPLETED";
      }),
    [filter, sprints, now]
  );

  const sortedByStartAsc = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ),
    [filtered]
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <FilterChips onFilterChange={setFilter} selected={filter} />
      </div>

      <PhaseSection
        now={now}
        progressById={progressById}
        sprints={sortedByStartAsc}
      />
    </div>
  );
}
