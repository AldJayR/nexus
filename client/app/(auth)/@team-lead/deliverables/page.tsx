import { auth } from "@/auth";
import TeamLeadDeliverablesPage from "@/components/team-lead/deliverables";

export default async function Page() {
  const session = await auth();

  // HARD GATE: Team Lead only
  if (session?.user?.role !== "teamLead") {
    return null;
  }

  return <TeamLeadDeliverablesPage />;
}
