import { format } from "date-fns";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTitleCase } from "@/lib/helpers/format-title-case";
import { getSprintStatus } from "@/lib/helpers/sprint";
import type { Sprint, SprintProgress } from "@/lib/types";

type PhaseSectionProps = {
  title: string;
  subtitle?: string;
  badgeText?: string;
  sprints: Sprint[];
  progressById: Record<string, SprintProgress | undefined>;
  now: Date;
};

export function PhaseSection({
  title,
  subtitle,
  badgeText,
  sprints,
  progressById,
  now,
}: PhaseSectionProps) {
  if (sprints.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="space-y-0.5">
          <h2 className="font-semibold text-lg">{title}</h2>
          {subtitle ? (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          ) : null}
        </div>
        {badgeText ? <Badge variant="secondary">{badgeText}</Badge> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sprints.map((sprint) => {
          const status = getSprintStatus(sprint, now);
          const progress = progressById[sprint.id];
          const percent = progress?.percentage ?? 0;

          return (
            <Card key={sprint.id}>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle>Sprint {sprint.number}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {sprint.goal || "No goal set"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      status === "ACTIVE"
                        ? "default"
                        : status === "COMPLETED"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {formatTitleCase(status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {progress
                        ? `${progress.completedTasks}/${progress.totalTasks}`
                        : "0/0"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="font-medium">
                    {format(new Date(sprint.startDate), "MMM d")} to{" "}
                    {format(new Date(sprint.endDate), "MMM d")}
                  </span>
                </div>

                <Button asChild className="w-full" variant="outline">
                  <Link href={`/sprints/${sprint.id}`}>Open Sprint Board</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
