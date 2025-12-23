/**
 * Team Lead Dashboard Page
 * Server component that aggregates project data and renders dashboard sections
 */

import { Suspense } from "react";
import { ActivityLogs } from "@/components/team-lead/dashboard/activity-logs";
import { BlockedItemsList } from "@/components/team-lead/dashboard/blocked-items-list";
import { PendingApprovalsList } from "@/components/team-lead/dashboard/pending-approvals-list";
import { PhaseProgressCards } from "@/components/team-lead/dashboard/phase-progress-cards";
import { ProjectHealthCard } from "@/components/team-lead/dashboard/project-health-card";
import {
  ActivityLogsSkeleton,
  BlockedItemsSkeleton,
  PhaseCardsSkeleton,
  ProjectHealthSkeleton,
  SprintHealthSkeleton,
  TeamContributionsSkeleton,
} from "@/components/team-lead/dashboard/skeletons";
import { SprintHealthCard } from "@/components/team-lead/dashboard/sprint-health-card";
import { TeamContributionsTable } from "@/components/team-lead/dashboard/team-contributions-table";
import { activityLogApi } from "@/lib/api/activity-log";
import { deliverableApi } from "@/lib/api/deliverable";
import { phaseApi } from "@/lib/api/phase";
import { sprintApi } from "@/lib/api/sprint";
import { taskApi } from "@/lib/api/task";
import { userApi } from "@/lib/api/user";
import {
  computePhaseProgress,
  computeProjectCompletion,
  computeSprintHealth,
  computeTeamMemberSummary,
  findCurrentSprint,
  getBlockedTasks,
  getPendingApprovals,
} from "@/lib/helpers/dashboard-computations";

export const metadata = {
  title: "Dashboard",
  description: "Team Lead project overview and metrics",
};

async function ProjectHealthSection() {
  try {
    const deliverables = await deliverableApi.listDeliverables();
    const completion = computeProjectCompletion(deliverables);

    return (
      <ProjectHealthCard
        completion={completion}
        targetDate={new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString()}
        targetPercentage={70}
      />
    );
  } catch (error) {
    console.error("Failed to fetch project health:", error);
    // Return default empty state
    return (
      <ProjectHealthCard
        completion={{
          overallPercentage: 0,
          totalDeliverables: 0,
          completedDeliverables: 0,
          inProgressDeliverables: 0,
          reviewDeliverables: 0,
        }}
      />
    );
  }
}

async function PhaseProgressSection() {
  try {
    const [deliverables, phases] = await Promise.all([
      deliverableApi.listDeliverables(),
      phaseApi.listPhases(),
    ]);

    const phaseProgressData = phases.map((phase) =>
      computePhaseProgress(phase, deliverables)
    );

    return <PhaseProgressCards phases={phaseProgressData} />;
  } catch (error) {
    console.error("Failed to fetch phase progress:", error);
    return <PhaseProgressCards phases={[]} />;
  }
}

async function SprintHealthSection() {
  try {
    const [sprints, tasks] = await Promise.all([
      sprintApi.listSprints(),
      taskApi.listTasks(),
    ]);

    const currentSprint = findCurrentSprint(sprints);

    if (!currentSprint) {
      return (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">No active sprint</p>
        </div>
      );
    }

    const sprintHealth = computeSprintHealth(currentSprint, tasks);

    // Filter tasks for current sprint
    const sprintTasks = tasks.filter(
      (task) => task.sprintId === currentSprint.id
    );

    // Fetch real sprint progress data for burndown chart
    let chartData: Array<{ name: string; value: number; fill: string }> = [];
    try {
      const _progress = await sprintApi.getSprintProgress(currentSprint.id);
      // If the API returns historical data, map it to chart format
      // For now, create a simple representation of current progress
      const startTasks = sprintHealth.totalTasks;
      const completedTasks = sprintHealth.doneTasks;
      const remainingTasks = startTasks - completedTasks;

      chartData = [
        {
          name: "Remaining",
          value: remainingTasks,
          fill: "var(--color-week1)",
        },
      ];
    } catch (error) {
      console.error("Failed to fetch sprint progress:", error);
      // Fallback: show current task counts as a simple chart
      chartData = [
        {
          name: "To Do",
          value: sprintHealth.todoTasks,
          fill: "var(--color-week1)",
        },
        {
          name: "In Progress",
          value: sprintHealth.inProgressTasks,
          fill: "var(--color-week2)",
        },
        {
          name: "Done",
          value: sprintHealth.doneTasks,
          fill: "var(--color-week3)",
        },
      ];
    }

    return (
      <SprintHealthCard
        chartData={chartData}
        sprint={sprintHealth}
        tasks={sprintTasks}
      />
    );
  } catch (error) {
    console.error("Failed to fetch sprint health:", error);
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">
          Unable to load sprint data
        </p>
      </div>
    );
  }
}

async function BlockedItemsSection() {
  try {
    const [tasks, users] = await Promise.all([
      taskApi.listTasks(),
      userApi.listUsers(),
    ]);

    const blockedTasks = getBlockedTasks(tasks, users);

    const allBlockedItems = [...blockedTasks].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return <BlockedItemsList items={allBlockedItems} />;
  } catch (error) {
    console.error("Failed to fetch blocked items:", error);
    return <BlockedItemsList items={[]} />;
  }
}

async function PendingApprovalsSection() {
  try {
    const deliverables = await deliverableApi.listDeliverables();

    const pendingApprovals = getPendingApprovals(deliverables);

    const sortedApprovals = [...pendingApprovals].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return <PendingApprovalsList items={sortedApprovals} />;
  } catch (error) {
    console.error("Failed to fetch pending approvals:", error);
    return <PendingApprovalsList items={[]} />;
  }
}

async function TeamContributionsSection() {
  try {
    const [users, tasks] = await Promise.all([
      userApi.listUsers(),
      taskApi.listTasks(),
    ]);

    const activeUsers = users.filter((u) => !u.deletedAt);

    const memberSummaries = await Promise.all(
      activeUsers.map(async (user) => {
        try {
          const contribution = await userApi.getUserContributions(user.id);
          return computeTeamMemberSummary(user, contribution, tasks);
        } catch (error) {
          console.error(
            `Failed to fetch contributions for user ${user.id}:`,
            error
          );
          // Return default contribution if fetching fails
          return computeTeamMemberSummary(
            user,
            {
              assignedTasksCount: 0,
              completedTasksCount: 0,
              uploadedEvidenceCount: 0,
              commentsCount: 0,
            },
            tasks
          );
        }
      })
    );

    return <TeamContributionsTable members={memberSummaries} />;
  } catch (error) {
    console.error("Failed to fetch team contributions:", error);
    return <TeamContributionsTable members={[]} />;
  }
}

async function ActivityLogsSection() {
  try {
    const activities = await activityLogApi.listActivityLogs();
    console.log(
      "📋 Activity logs fetched:",
      activities.length,
      "items",
      activities.slice(0, 2)
    );

    const sortedActivities = activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log("📋 Sorted activities:", sortedActivities.length, "items");
    return <ActivityLogs activities={sortedActivities} limit={5} />;
  } catch (error) {
    console.error("❌ Failed to fetch activity logs:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    // Return empty feed on error
    return <ActivityLogs activities={[]} limit={5} />;
  }
}

export default function DashboardPage() {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-screen-2xl space-y-8">
        <Suspense fallback={<ProjectHealthSkeleton />}>
          <ProjectHealthSection />
        </Suspense>

        <Suspense fallback={<PhaseCardsSkeleton />}>
          <PhaseProgressSection />
        </Suspense>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Suspense fallback={<SprintHealthSkeleton />}>
            <SprintHealthSection />
          </Suspense>

          <Suspense fallback={<ActivityLogsSkeleton />}>
            <ActivityLogsSection />
          </Suspense>
        </div>

        <Suspense fallback={<BlockedItemsSkeleton />}>
          <BlockedItemsSection />
        </Suspense>

        <Suspense fallback={<BlockedItemsSkeleton />}>
          <PendingApprovalsSection />
        </Suspense>

        <Suspense fallback={<TeamContributionsSkeleton />}>
          <TeamContributionsSection />
        </Suspense>
      </div>
    </main>
  );
}
