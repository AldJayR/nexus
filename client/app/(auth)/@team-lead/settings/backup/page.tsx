import { auth } from "@/auth";
import BackupSettings from "@/components/team-lead/settings/backup";

export default async function BackupPage() {
  const session = await auth();

  // HARD GATE: Team Lead only
  if (session?.user?.role !== "teamLead") {
    return null;
  }

  return <BackupSettings />;
}
