import { MemberSprintsClient } from "@/components/member/sprints/member-sprints-client";
import { authApi } from "@/lib/api/auth";
import { phaseApi } from "@/lib/api/phase";
import { sprintApi } from "@/lib/api/sprint";
import { taskApi } from "@/lib/api/task";

export const metadata = {
  title: "My Sprints",
  description: "View and manage sprints assigned to you",
};

export default async function Page() {
  // Get current user
  const currentUser = await authApi.getCurrentUser();
  if (!currentUser) {
    return null;
  }

  // Fetch sprints and phases
  const [sprints, phases, allTasks] = await Promise.all([
    sprintApi.listSprints(),
    phaseApi.listPhases(),
    taskApi.listTasks(),
  ]);

  // Filter tasks assigned to current user
  const userAssignedTasks = allTasks.filter(
    (task) => task.assigneeId === currentUser.id
  );
  const userAssignedTaskIds = new Set(userAssignedTasks.map((t) => t.id));

  // Filter sprints that have at least one task assigned to the user
  const assignedSprints = sprints.filter((sprint) =>
    allTasks.some(
      (task) =>
        task.sprintId === sprint.id && task.assigneeId === currentUser.id
    )
  );

  // Fetch progress for assigned sprints only
  const progressEntries = await Promise.all(
    assignedSprints.map(async (sprint) => {
      try {
        const progress = await sprintApi.getSprintProgress(sprint.id);
        return [sprint.id, progress] as const;
      } catch {
        return [sprint.id, undefined] as const;
      }
    })
  );

  const progressById = Object.fromEntries(progressEntries);

  return (
    <MemberSprintsClient
      phases={phases}
      progressById={progressById}
      sprints={assignedSprints}
      userAssignedTaskIds={userAssignedTaskIds}
    />
  );
}
