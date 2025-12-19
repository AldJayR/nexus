import type { ComponentProps, HTMLAttributes } from "react";
import type { DeliverableStatus, TaskStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = DeliverableStatus | TaskStatus;

export type StatusBadgeProps = ComponentProps<typeof Badge> & {
  status: StatusType;
};

const formatStatusLabel = (status: StatusType): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const getStatusClass = (status: StatusType): string => {
  switch (status) {
    case "COMPLETED":
    case "DONE":
      return "completed";
    case "IN_PROGRESS":
      return "in-progress";
    case "REVIEW":
      return "review";
    case "BLOCKED":
      return "blocked";
    case "TODO":
      return "todo";
    case "NOT_STARTED":
    default:
      return "not-started";
  }
};

export const StatusBadge = ({
  className,
  status,
  ...props
}: StatusBadgeProps) => (
  <Badge
    className={cn("flex items-center gap-2", "group", getStatusClass(status), className)}
    variant="secondary"
    {...props}
  >
    <StatusIndicator />
    <StatusLabel>{formatStatusLabel(status)}</StatusLabel>
  </Badge>
);

export type StatusIndicatorProps = HTMLAttributes<HTMLSpanElement>;

export const StatusIndicator = ({
  className,
  ...props
}: StatusIndicatorProps) => (
  <span className="relative flex size-2" {...props}>
    <span
      className={cn(
        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
        "group-[.completed]:bg-green-500",
        "group-[.in-progress]:bg-blue-500",
        "group-[.review]:bg-purple-500",
        "group-[.blocked]:bg-red-500",
        "group-[.todo]:bg-slate-500",
        "group-[.not-started]:bg-slate-500"
      )}
    />
    <span
      className={cn(
        "relative inline-flex size-2 rounded-full",
        "group-[.completed]:bg-green-500",
        "group-[.in-progress]:bg-blue-500",
        "group-[.review]:bg-purple-500",
        "group-[.blocked]:bg-red-500",
        "group-[.todo]:bg-slate-500",
        "group-[.not-started]:bg-slate-500"
      )}
    />
  </span>
);

export type StatusLabelProps = HTMLAttributes<HTMLSpanElement> & {
  children?: React.ReactNode;
};

export const StatusLabel = ({
  className,
  children,
  ...props
}: StatusLabelProps) => (
  <span className={cn("text-muted-foreground text-xs", className)} {...props}>
    {children}
  </span>
);
