"use client";

import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Task, User } from "@/lib/types";

export type TaskCardProps = {
  task: Task;
  assignee: User | undefined;
  onTaskClick: (task: Task) => void;
  onBlockClick: (task: Task) => void;
  interaction?: "drag" | "tap";
};

export function TaskCard({
  task,
  assignee,
  onTaskClick,
  interaction = "drag",
}: TaskCardProps) {
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
      onClick={() => onTaskClick(task)}
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

      {assignee ? (
        <Badge className="text-xs" variant="secondary">
          {assignee.name}
        </Badge>
      ) : null}
    </div>
  );
}
