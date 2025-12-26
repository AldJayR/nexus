import { auth } from "@/auth";
import { ActivityLogsClient } from "@/components/team-lead/settings/activity-logs";
import { activityLogApi } from "@/lib/api/activity-log";

export const metadata = {
  title: "Activity Logs",
  description: "View all team activity and system events",
};

export default async function ActivityLogsPage() {
  const session = await auth();

  // HARD GATE: Team Lead only
  if (session?.user?.role !== "teamLead") {
    return null;
  }

  const activities = await activityLogApi.listActivityLogs();

  return <ActivityLogsClient activities={activities} />;
}
