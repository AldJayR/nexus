"use client";

import { Bell, Search, Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * App Header Component
 * Provides main navigation header with sidebar toggle, search, notifications, and user avatar
 */
export function AppHeader({ title }: { title?: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-sidebar">
      <div className="flex items-center gap-2 px-3">
        <SidebarTrigger
          aria-label="Toggle sidebar navigation"
          className="rounded-md transition-colors hover:bg-accent"
        />
        <Separator aria-hidden="true" className="h-4" orientation="vertical" />
        {title ? (
          <h1 className="font-semibold text-sm md:font-bold md:text-lg">
            {title}
          </h1>
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 px-4 md:gap-6">
        <div className="hidden w-full max-w-xs items-center gap-2 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search" className="pl-9" placeholder="Search" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            aria-label="Notifications"
            className="relative"
            size="icon"
            variant="ghost"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </Button>
          <Button aria-label="Settings" size="icon" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <Avatar>
          <AvatarFallback>AU</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
