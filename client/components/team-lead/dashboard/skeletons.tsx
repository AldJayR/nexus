/**
 * Dashboard Skeleton Loaders
 * Replicates the structure of actual dashboard sections
 */

import { Frame, FrameHeader, FramePanel } from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectHealthSkeleton() {
  return (
    <FramePanel className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: percentage and trend */}
        <div className="flex flex-wrap items-end gap-2">
          {/* Large percentage number */}
          <Skeleton className="h-12 w-32" />
          {/* Trend indicator */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Right side: status and target */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Deliverables tracker section */}
      <div className="mt-6 space-y-2">
        <Skeleton className="h-3 w-32" />
        {/* Tracker blocks */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
            <Skeleton className="h-4 flex-1 rounded-none" key={i} />
          ))}
        </div>
      </div>
    </FramePanel>
  );
}

export function PhaseCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Frame key={i}>
          <FrameHeader className="flex-row items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="h-3 w-32" />
          </FrameHeader>
          <FramePanel className="space-y-2">
            {/* Status badge and percentage row */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>

            {/* Progress bar and completed count */}
            <div className="space-y-2">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          </FramePanel>
        </Frame>
      ))}
    </div>
  );
}

export function SprintHealthSkeleton() {
  return (
    <Frame>
      <FrameHeader className="flex-row items-start justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-4 w-28 shrink-0 rounded-full" />
      </FrameHeader>

      <FramePanel className="space-y-6">
        {/* Task Distribution */}
        <div className="mt-1 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-3 w-16" />
          </div>
          {/* Tracker blocks */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <Skeleton className="h-4 flex-1 rounded-none" key={i} />
            ))}
          </div>
        </div>

        {/* Sprint Progress */}
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded" />
          <Skeleton className="h-3 w-12" />
        </div>

        {/* Sprint Timeline */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </FramePanel>
    </Frame>
  );
}

export function ActivityLogsSkeleton() {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </FrameHeader>
      <FramePanel>
        <div className="space-y-0">
          {[1, 2, 3].map((i) => (
            <div
              className="flex items-center justify-between gap-4 py-2"
              key={i}
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </FramePanel>
    </Frame>
  );
}

export function BlockedItemsSkeleton() {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </FrameHeader>
      <FramePanel>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div className="flex items-start gap-4 p-4" key={i}>
              <Skeleton className="mt-1 h-8 w-8 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-16 shrink-0" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </FramePanel>
    </Frame>
  );
}

export function PendingApprovalsSkeleton() {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-8 w-20" />
      </FrameHeader>
      <FramePanel>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div className="flex items-start gap-4 p-4" key={i}>
              <Skeleton className="mt-1 h-8 w-8 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-16 shrink-0" />
                </div>
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </FramePanel>
    </Frame>
  );
}

export function TeamContributionsSkeleton() {
  return (
    <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="absolute -bottom-6 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <FramePanel className="h-41 w-82 bg-card" key={i}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <div className="min-w-0 flex-1">
                <Skeleton className="mb-1 h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((index) => (
                  <div className="flex flex-col items-center" key={index}>
                    <Skeleton className="mb-2 h-6 w-4" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <Skeleton className="size-25 rounded-full bg-accent/60" />
            </div>
          </div>
        </FramePanel>
      ))}
    </div>
  );
}
