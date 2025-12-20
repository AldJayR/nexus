import { getCurrentUser } from "@/actions/user";
import { TeamMembersClient } from "@/components/team-lead/settings/team-members/client";
import { getTeamUsers } from "@/lib/data/team";

export const metadata = {
  title: "Team Members",
  description: "Manage and invite team members",
};

export default async function TeamMembersPage() {
  const [data, currentUser] = await Promise.all([
    getTeamUsers(),
    getCurrentUser(),
  ]);

  return <TeamMembersClient currentUser={currentUser} data={data} />;
}
