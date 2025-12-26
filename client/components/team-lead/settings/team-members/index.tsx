import { TeamMembersClient } from "@/components/team-lead/settings/team-members/client";
import { getTeamUsers } from "@/lib/data/team";
import { getCurrentUser } from "@/lib/data/user";

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
