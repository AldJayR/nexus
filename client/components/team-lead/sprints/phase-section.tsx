import { Calendar, FolderXIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FrameDescription,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status";
import { formatDateRange } from "@/lib/helpers/format-date";
import { getSprintStatus } from "@/lib/helpers/sprint";
import type { Sprint, SprintProgress, TaskStatus } from "@/lib/types";

export function mapSprintStatusToTaskStatus(
  sprintStatus: "ACTIVE" | "PLANNED" | "COMPLETED"
): TaskStatus {
  switch (sprintStatus) {
    case "ACTIVE":
      return "IN_PROGRESS";
    case "PLANNED":
      return "TODO";
    case "COMPLETED":
      return "DONE";
  }
}

type PhaseSectionProps = {
  title: string;
  subtitle?: string;
  badgeText?: string;
  sprints: Sprint[];
  progressById: Record<string, SprintProgress | undefined>;
  now: Date;
};

export function PhaseSection({
  sprints,
  progressById,
  now,
}: PhaseSectionProps) {
  if (sprints.length === 0) {
    return (
      <EmptyState
        description="There are no sprints in this status yet."
        icon={FolderXIcon}
        title="No sprints available"
      />
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sprints.map((sprint) => {
        const sprintStatus = getSprintStatus(sprint, now);
        const progress = progressById[sprint.id];
        const percent = progress?.percentage ?? 0;

        return (
          <Suspense
            fallback={<Skeleton className="h-80 w-full" />}
            key={sprint.id}
          >
            <Link href={`/sprints/${sprint.id}`}>
              <FramePanel className="space-y-2 bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0">
                    <FrameTitle className="w-full truncate font-semibold text-base">
                      Sprint {sprint.number}
                    </FrameTitle>
                    <FrameDescription className="line-clamp-1">
                      {sprint.goal || "No goal set"}
                    </FrameDescription>
                  </div>
                  <StatusBadge
                    status={mapSprintStatusToTaskStatus(sprintStatus)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {progress
                          ? `${progress.completedTasks}/${progress.totalTasks}`
                          : "0/0"}
                      </span>
                    </div>
                    <Progress className="h-2" value={percent} />
                  </div>

                  <div className="flex items-center gap-2 text-sm [&_svg]:text-muted-foreground">
                    <Calendar size={16} />
                    <span className="font-medium">
                      {formatDateRange(sprint.startDate, sprint.endDate)}
                    </span>
                  </div>
                </div>
              </FramePanel>
            </Link>
          </Suspense>
        );
      })}
    </section>
  );
}
