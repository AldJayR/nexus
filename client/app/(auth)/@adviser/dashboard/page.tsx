import { auth } from "@/auth";

export const metadata = {
  title: "Dashboard",
  description: "Adviser project overview (read-only)",
};

export default async function Page() {
  const session = await auth();

  // HARD GATE: Stop execution immediately if user is not an Adviser
  if (session?.user?.role !== "adviser") {
    return null;
  }

  return <div>Adviser Dashboard - Coming Soon</div>;
}
