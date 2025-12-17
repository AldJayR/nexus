"use client";

import {
  CalendarDays,
  ClipboardList,
  FolderOpen,
  GalleryVerticalEnd,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Shapes,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  items?: NavItem[];
};

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "Project",
    items: [
      { title: "Phases", href: "/phases", icon: Shapes },
      { title: "Sprints", href: "/sprints", icon: ClipboardList },
    ],
  },
  {
    title: "Planning",
    items: [
      { title: "Meetings", href: "/meetings", icon: CalendarDays },
      { title: "Deliverables", href: "/deliverables", icon: FolderOpen },
    ],
  },
  { title: "Settings", href: "/settings", icon: Settings },
] as const;

const AUTH_ROUTE_REGEX = /^\/(auth)/;

export function AppSidebar() {
  const pathname = usePathname();

  // Strip the (auth) route group from pathname
  const cleanPathname = pathname.replace(AUTH_ROUTE_REGEX, "") || "/";

  const isActive = (href: string) => {
    if (href === "#") {
      return false;
    }
    return cleanPathname === href;
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Nexus</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <React.Fragment key={item.title}>
                {item.items ? (
                  <>
                    <SidebarGroupLabel className="mt-4">
                      {item.title}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                      {item.items.map((subItem) => (
                        <SidebarMenuItem key={subItem.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(subItem.href || "")}
                          >
                            <Link href={subItem.href || ""}>
                              {subItem.icon ? (
                                <subItem.icon className="size-4" />
                              ) : null}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </>
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href || "")}
                    >
                      <Link href={item.href || ""}>
                        {item.icon ? <item.icon className="size-4" /> : null}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </React.Fragment>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
