import { deleteTeamMembers } from "@/actions/team-members";
import { TeamMembersClient } from "@/components/team-lead/settings/team-members/client";
import { getTeamUsers } from "@/lib/data/team";

export const metadata = {
  title: "Team Members",
  description: "Manage and invite team members",
};

export default async function TeamMembersPage() {
  const data = await getTeamUsers();

  return <TeamMembersClient data={data} onDelete={deleteTeamMembers} />;
}
