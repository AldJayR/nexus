import SummaryCardsRow from "@/components/team-lead/meetings/summary-cards";
import { MeetingsTable } from "@/components/team-lead/meetings/table/body";
import { getMeetingsData } from "@/lib/data/meetings";

/**
 * Team Lead Meetings Page
 *
 * Displays meeting analytics and documentation for the project
 * Fetches and aggregates meetings from all sprints and phases
 * Allows Team Lead to upload meeting minutes
 */
export default async function TeamLeadMeetingsPage() {
	const { logs, sprints, phases } = await getMeetingsData();

	return (
		<div className="space-y-8">
			<SummaryCardsRow logs={logs} sprints={sprints} phases={phases} />
			<MeetingsTable initialLogs={logs} phases={phases} sprints={sprints} />
		</div>
	);
}
