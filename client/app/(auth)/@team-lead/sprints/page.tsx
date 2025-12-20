import { CreateSprintButton } from "@/components/team-lead/sprints/create-sprint-button";
import {
  FilterChips,
  type FilterKey,
} from "@/components/team-lead/sprints/filter-chips";
import { PhaseSection } from "@/components/team-lead/sprints/phase-section";
import { phaseApi } from "@/lib/api/phase";
import { sprintApi } from "@/lib/api/sprint";
import { getPhaseTypeForSprint, getSprintStatus } from "@/lib/helpers/sprint";
import type { Sprint } from "@/lib/types";
import { PhaseType } from "@/lib/types";

function parseFilter(value: unknown): FilterKey {
  if (value === "active") {
    return "active";
  }
  if (value === "planned") {
    return "planned";
  }
  if (value === "completed") {
    return "completed";
  }
  return "all";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter = parseFilter(rawFilter);

  const now = new Date();
  const [sprints, phases] = await Promise.all([
    sprintApi.listSprints(),
    phaseApi.listPhases(),
  ]);

  const filtered = sprints.filter((sprint) => {
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
  });

  const progressEntries = await Promise.all(
    filtered.map(async (sprint) => {
      try {
        const progress = await sprintApi.getSprintProgress(sprint.id);
        return [sprint.id, progress] as const;
      } catch {
        return [sprint.id, undefined] as const;
      }
    })
  );

  const progressById = Object.fromEntries(progressEntries);

  const sortedByStartAsc = [...filtered].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const byPhase: Record<PhaseType, Sprint[]> = {
    [PhaseType.WATERFALL]: [],
    [PhaseType.SCRUM]: [],
    [PhaseType.FALL]: [],
  };

  for (const sprint of filtered) {
    const phaseType = getPhaseTypeForSprint(sprint, phases, sortedByStartAsc);
    byPhase[phaseType].push(sprint);
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips selected={filter} />
        <CreateSprintButton />
      </div>

      <div className="space-y-10">
        <PhaseSection
          badgeText="Planning"
          now={now}
          progressById={progressById}
          sprints={byPhase[PhaseType.WATERFALL]}
          subtitle={subtitleByPhase[PhaseType.WATERFALL]}
          title={titleByPhase[PhaseType.WATERFALL]}
        />
        <PhaseSection
          badgeText="Development"
          now={now}
          progressById={progressById}
          sprints={byPhase[PhaseType.SCRUM]}
          subtitle={subtitleByPhase[PhaseType.SCRUM]}
          title={titleByPhase[PhaseType.SCRUM]}
        />
        <PhaseSection
          badgeText="Delivery"
          now={now}
          progressById={progressById}
          sprints={byPhase[PhaseType.FALL]}
          subtitle={subtitleByPhase[PhaseType.FALL]}
          title={titleByPhase[PhaseType.FALL]}
        />
      </div>
    </div>
  );
}
