import { Frame, FrameHeader, FramePanel, FrameTitle } from "../ui/frame";
import { Skeleton } from "../ui/skeleton";

export default function FrameSkeleton() {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <Skeleton className="size-8 rounded-md" />
        <FrameTitle className="line-clamp-1 text-sm">
          <Skeleton className="h-5 w-32" />
        </FrameTitle>
      </FrameHeader>
      <FramePanel className="space-y-2">
        {/* Status badge and percentage row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-7 w-16" />
        </div>

        {/* Progress bar and completed count */}
        <div className="space-y-2">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      </FramePanel>
    </Frame>
  );
}
