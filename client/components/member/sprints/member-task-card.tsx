"use client";

import { GripVertical } from "lucide-react";
import type { Task } from "@/lib/types";

export type MemberTaskCardProps = {
  task: Task;
  interaction?: "tap" | "drag";
  onTaskClick?: (task: Task) => void;
};

/**
 * Display-only task card for members
 * Shows task title and description
 * Used in member Kanban board for drag-and-drop
 * Can trigger task detail dialog via onTaskClick callback
 */
export function MemberTaskCard({
  task,
  interaction = "drag",
  onTaskClick,
}: MemberTaskCardProps) {
  return (
    <div
      className={`group space-y-2 rounded-md border p-3 transition-all ${
        task.status === "BLOCKED"
          ? `border-destructive/70 bg-card/20 ${
              interaction === "tap" ? "cursor-pointer" : "cursor-move"
            }`
          : interaction === "tap"
            ? "cursor-pointer"
            : "cursor-move"
      }`}
      onClick={() => onTaskClick?.(task)}
      onKeyDown={(e) => {
        if (onTaskClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onTaskClick(task);
        }
      }}
      role={onTaskClick ? "button" : undefined}
      tabIndex={onTaskClick ? 0 : undefined}
    >
      <div className="flex justify-between gap-2">
        <div className="space-y-1">
          <p className="line-clamp-2 font-medium">{task.title}</p>
          {task.description ? (
            <p className="line-clamp-1 text-muted-foreground text-sm">
              {task.description}
            </p>
          ) : null}
        </div>
        <GripVertical className="hidden size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground md:block" />
      </div>
    </div>
  );
}
