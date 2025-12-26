"use client";

import { useMemo, useState } from "react";

import {
  FilterChips,
  type FilterKey,
} from "@/components/team-lead/sprints/filter-chips";
import { PhaseSection } from "@/components/team-lead/sprints/phase-section";
import { getPhaseTypeForSprint, getSprintStatus } from "@/lib/helpers/sprint";
import type { Phase, Sprint, SprintProgress } from "@/lib/types";
import { PhaseType } from "@/lib/types";

type MemberSprintsClientProps = {
  sprints: Sprint[];
  phases: Phase[];
  progressById: Record<string, SprintProgress | undefined>;
  userAssignedTaskIds: Set<string>;
};

export function MemberSprintsClient({
  sprints,
  phases,
  progressById,
  userAssignedTaskIds,
}: MemberSprintsClientProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const now = new Date();

  // Filter sprints to only those where user has assigned tasks
  const assignedSprints = useMemo(
    () => sprints.filter((_sprint) => userAssignedTaskIds.size > 0),
    [sprints, userAssignedTaskIds]
  );

  const filtered = useMemo(
    () =>
      assignedSprints.filter((sprint) => {
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
    [filter, assignedSprints, now]
  );

  const sortedByStartAsc = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ),
    [filtered]
  );

  const byPhase = useMemo(() => {
    const result: Record<PhaseType, Sprint[]> = {
      [PhaseType.WATERFALL]: [],
      [PhaseType.SCRUM]: [],
      [PhaseType.FALL]: [],
    };

    for (const sprint of filtered) {
      const phaseType = getPhaseTypeForSprint(sprint, phases, sortedByStartAsc);
      result[phaseType].push(sprint);
    }

    return result;
  }, [filtered, phases, sortedByStartAsc]);

  const titleByPhase: Record<PhaseType, string> = {
    [PhaseType.WATERFALL]: "Waterfall Phase",
    [PhaseType.SCRUM]: "Scrum Phase",
    [PhaseType.FALL]: "Fall Phase",
  };

  const subtitleByPhase: Record<PhaseType, string> = {
    [PhaseType.WATERFALL]: "Planning and design work",
    [PhaseType.SCRUM]: "Development and iteration",
    [PhaseType.FALL]: "Testing, deployment, and closure",
  };

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No sprints assigned to you yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <FilterChips onFilterChange={setFilter} selected={filter} />
      </div>

      <PhaseSection
        badgeText="Development"
        now={now}
        progressById={progressById}
        sprints={byPhase[PhaseType.SCRUM]}
        subtitle={subtitleByPhase[PhaseType.SCRUM]}
        title={titleByPhase[PhaseType.SCRUM]}
      />
    </div>
  );
}
