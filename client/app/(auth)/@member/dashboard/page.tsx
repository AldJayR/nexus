import { auth } from "@/auth";

export const metadata = {
  title: "Dashboard",
  description: "Team Member dashboard",
};

export default async function Page() {
  const session = await auth();

  // HARD GATE: Stop execution immediately if user is not a Member
  if (session?.user?.role !== "member") {
    return null;
  }

  return <div>Member Dashboard - Coming Soon</div>;
}
