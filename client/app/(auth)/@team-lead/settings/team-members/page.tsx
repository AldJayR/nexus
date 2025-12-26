import { auth } from "@/auth";
import TeamMembers from "@/components/team-lead/settings/team-members";

export default async function TeamMembersPage() {
  const session = await auth();

  // HARD GATE: Team Lead only
  if (session?.user?.role !== "teamLead") {
    return null;
  }

  return <TeamMembers />;
}
