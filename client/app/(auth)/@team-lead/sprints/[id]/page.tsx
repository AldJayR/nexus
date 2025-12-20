import { format } from "date-fns";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CreateTaskDialog } from "@/components/team-lead/sprints/create-task-dialog";
import { KanbanBoard } from "@/components/team-lead/sprints/tasks/kanban-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sprintApi } from "@/lib/api/sprint";
import { taskApi } from "@/lib/api/task";
import { userApi } from "@/lib/api/user";
import { getSprintStatus } from "@/lib/helpers/sprint";

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
      <div>
        <Button asChild className="mb-2" size="sm" variant="ghost">
          <Link href="/sprints">
            <ChevronLeftIcon />
            Back to Sprints
          </Link>
        </Button>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-semibold text-2xl">Sprint {sprint.number}</h1>
            <Badge
              variant={
                status === "ACTIVE"
                  ? "default"
                  : status === "PLANNED"
                    ? "secondary"
                    : "outline"
              }
            >
              {status}
            </Badge>
          </div>
          {sprint.goal ? (
            <p className="text-muted-foreground">{sprint.goal}</p>
          ) : null}
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Start Date</p>
          <p className="font-medium">
            {format(new Date(sprint.startDate), "MMM d, yyyy")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">End Date</p>
          <p className="font-medium">
            {format(new Date(sprint.endDate), "MMM d, yyyy")}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Task Board</h2>
          <CreateTaskDialog sprintId={sprint.id} users={users} />
        </div>
        <KanbanBoard sprintId={sprint.id} tasks={tasks} users={users} />
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
