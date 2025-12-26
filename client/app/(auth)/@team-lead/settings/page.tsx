import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function SettingsPage() {
  const session = await auth();

  // HARD GATE: Team Lead only
  if (session?.user?.role !== "teamLead") {
    return null;
  }

  redirect("/settings/team-members");
}
