import { deleteTeamMembers, getTeamMembers } from "@/actions/team-members";
import { TeamMembersClient } from "@/components/team-lead/settings/team-members/client";

export const metadata = {
  title: "Team Members",
  description: "Manage and invite team members",
};

export default async function TeamMembersPage() {
  const data = await getTeamMembers();

  return <TeamMembersClient data={data} onDelete={deleteTeamMembers} />;
}
