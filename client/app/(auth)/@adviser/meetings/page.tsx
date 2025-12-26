import SummaryCardsRow from "@/components/shared/meetings/summary-cards";
import { MeetingsTable } from "@/components/shared/meetings/table/body";
import { getMeetingsData } from "@/lib/data/meetings";

/**
 * Adviser Meetings Page
 *
 * Read-only view of meeting logs and analytics for advisers.
 * Advisers can view all project meeting documentation and analytics.
 */
export default async function AdviserMeetingsPage() {
  const { logs, sprints, phases } = await getMeetingsData();

  return (
    <div className="space-y-8">
      <SummaryCardsRow logs={logs} phases={phases} sprints={sprints} />
      <MeetingsTable initialLogs={logs} phases={phases} sprints={sprints} />
    </div>
  );
}
