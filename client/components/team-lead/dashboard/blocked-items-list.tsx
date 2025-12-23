/**
 * Blocked Items List
 * Shows tasks and deliverables that need attention
 */
"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import type { BlockedItem } from "@/lib/helpers/dashboard-computations";

type BlockedItemsListProps = {
  items: BlockedItem[];
};

export function BlockedItemsList({ items }: BlockedItemsListProps) {
  if (items.length === 0) {
    return (
      <Frame>
        <FrameHeader className="flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-linear-120 from-red-500 to-red-400 p-2 shadow-sm dark:from-red-800 dark:to-red-700">
              <AlertCircle className="size-4 text-white" />
            </div>
            <FrameTitle className="text-sm">Blocked Items</FrameTitle>
          </div>
        </FrameHeader>
        <FramePanel>
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
              <AlertCircle className="h-6 w-6 text-chart-2" />
            </div>
            <p className="mt-4 font-medium text-muted-foreground text-sm">
              No blocked items
            </p>
            <p className="text-muted-foreground text-xs">
              All tasks and deliverables are progressing smoothly
            </p>
          </div>
        </FramePanel>
      </Frame>
    );
  }

  return (
    <Frame>
      <FrameHeader className="flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-linear-120 from-red-500 to-red-400 p-2 shadow-sm dark:from-red-800 dark:to-red-700">
            <AlertCircle className="size-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <FrameTitle className="text-sm">Blocked Items</FrameTitle>
            <Badge variant="destructive">{items.length}</Badge>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/sprints">View All</Link>
        </Button>
      </FrameHeader>
      <FramePanel>
        <div className="divide-y divide-border">
          {items.slice(0, 5).map((item) => (
            <Link
              className="group flex items-start gap-4 p-4 transition-colors hover:bg-muted/50"
              href={item.type === "task" ? "/sprints" : "/deliverables"}
              key={item.id}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium text-sm leading-tight group-hover:text-primary">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        className="text-[10px]"
                        variant={item.type === "task" ? "secondary" : "outline"}
                      >
                        {item.type === "task" ? "Task" : "Deliverable"}
                      </Badge>
                      {item.assignee && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <User className="h-3 w-3" />
                          {item.assignee.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                {item.reason && (
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.reason}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {items.length > 5 && (
          <div className="border-border border-t p-3 text-center">
            <Button asChild size="sm" variant="outline">
              <Link href="/sprints">
                View {items.length - 5} more blocked items
              </Link>
            </Button>
          </div>
        )}
      </FramePanel>
    </Frame>
  );
}
