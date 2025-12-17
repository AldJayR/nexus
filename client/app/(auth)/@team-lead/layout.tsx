import { AppHeader } from "@/components/layouts/team-lead/header";
import { AppSidebar } from "@/components/layouts/team-lead/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function TeamLeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider suppressHydrationWarning>
      <AppSidebar />
      <SidebarInset suppressHydrationWarning>
        <AppHeader />
        <main className="p-4 sm:p-8 md:p-12" suppressHydrationWarning>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
