import { format } from "date-fns";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CreateTaskDialog } from "@/components/team-lead/sprints/create-task-dialog";
import { KanbanBoard } from "@/components/team-lead/sprints/tasks/kanban-board";
import { Button } from "@/components/ui/button";
import { sprintApi } from "@/lib/api/sprint";
import { taskApi } from "@/lib/api/task";
import { userApi } from "@/lib/api/user";
import { getSprintStatus } from "@/lib/helpers/sprint";
import { mapSprintStatusToTaskStatus } from "@/components/team-lead/sprints/phase-section";
import { StatusBadge } from "@/components/ui/status";
import { FramePanel } from "@/components/ui/frame";

async function SprintBoardContent({ sprintId }: { sprintId: string }) {
  const [sprint, tasks, users] = await Promise.all([
    sprintApi.getSprintById(sprintId),
    taskApi.listTasks({ sprintId }),
    userApi.listUsers(),
  ]);

  if (!sprint) {
    notFound();
  }

  const status = getSprintStatus(sprint);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost">
        <Link href="/sprints">
          <ChevronLeftIcon />
          Back to Sprints
        </Link>
      </Button>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">Sprint {sprint.number}</h1>
              <StatusBadge
                status={mapSprintStatusToTaskStatus(status)}
              />
            </div>
            {sprint.goal ? (
              <p className="text-muted-foreground">{sprint.goal}</p>
            ) : null}
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">
              {format(new Date(sprint.startDate), "MMM d, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End Date</p>
            <p className="font-medium">
              {format(new Date(sprint.endDate), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Task Board</h2>
          <CreateTaskDialog sprintId={sprint.id} users={users} />
        </div>
        <FramePanel>
          <KanbanBoard sprintId={sprint.id} tasks={tasks} users={users} />
        </FramePanel>
      </div>
    </div>
  );
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={<div className="py-8 text-center">Loading sprint...</div>}
    >
      <SprintBoardContent sprintId={id} />
    </Suspense>
  );
}
