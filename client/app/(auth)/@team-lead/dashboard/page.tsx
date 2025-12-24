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
import { TeamContributions } from "@/components/team-lead/dashboard/team-contributions";
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
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Dashboard",
  description: "Team Lead project overview and metrics",
};

async function ProjectHealthSection() {
  try {
    const [deliverables, phases] = await Promise.all([
      deliverableApi.listDeliverables(),
      phaseApi.listPhases(),
    ]);
    const completion = computeProjectCompletion(deliverables, phases);

    return (
      <ProjectHealthCard
        completion={completion}
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
          completedPhaseCount: 0,
          activePhaseCompletion: 0,
          isOnTrack: false,
          statusReason: "",
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

    return <SprintHealthCard sprint={sprintHealth} tasks={sprintTasks} />;
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
    const [users, tasks, activityLogs] = await Promise.all([
      userApi.listUsers(),
      taskApi.listTasks(),
      activityLogApi.listActivityLogs(),
    ]);

    const activeUsers = users.filter((u) => !u.deletedAt);

    const memberSummaries = await Promise.all(
      activeUsers.map(async (user) => {
        try {
          const contribution = await userApi.getUserContributions(user.id);

          // Get the most recent activity for this user
          const userActivities = activityLogs.filter(
            (log) => log.userId === user.id
          );
          const lastActivityDate =
            userActivities.length > 0
              ? userActivities.sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )[0].createdAt
              : undefined;

          return computeTeamMemberSummary(
            user,
            contribution,
            tasks,
            lastActivityDate
          );
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

    return <TeamContributions members={memberSummaries} />;
  } catch (error) {
    console.error("Failed to fetch team contributions:", error);
    return <TeamContributions members={[]} />;
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
          <Separator />
        </Suspense>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Suspense fallback={<SprintHealthSkeleton />}>
            <SprintHealthSection />
          </Suspense>

          <Suspense fallback={<ActivityLogsSkeleton />}>
            <ActivityLogsSection />
          </Suspense>

          <Suspense fallback={<BlockedItemsSkeleton />}>
            <BlockedItemsSection />
          </Suspense>

          <Suspense fallback={<BlockedItemsSkeleton />}>
            <PendingApprovalsSection />
          </Suspense>
          <Separator />
        </div>

        <Suspense fallback={<TeamContributionsSkeleton />}>
          <TeamContributionsSection />
        </Suspense>
      </div>
    </main>
  );
}
