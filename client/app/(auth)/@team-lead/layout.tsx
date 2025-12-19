import { getCurrentUser } from "@/actions/user";
import { AppHeader } from "@/components/layouts/team-lead/header";
import { AppSidebar } from "@/components/layouts/team-lead/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function TeamLeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user data server-side (no client-side useEffect needed)
  const user = await getCurrentUser();

  return (
    <SidebarProvider suppressHydrationWarning>
      <AppSidebar user={user} />
      <SidebarInset suppressHydrationWarning>
        <AppHeader />
        <main className="p-4 sm:p-8" suppressHydrationWarning>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
