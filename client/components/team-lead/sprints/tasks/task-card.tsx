"use client";

import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task, User } from "@/lib/types";

export type TaskCardProps = {
  task: Task;
  assignee: User | undefined;
  onBlockClick: (task: Task) => void;
  interaction?: "drag" | "tap";
};

export function TaskCard({
  task,
  assignee,
  onBlockClick,
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
        <GripVertical className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>

      <div className="flex flex-col gap-2">
        {assignee ? (
          <Badge className="text-xs" variant="secondary">
            {assignee.name}
          </Badge>
        ) : null}
        {task.status === "BLOCKED" ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onBlockClick(task);
            }}
            type="button"
            variant="ghost"
          >
            Edit Reason
          </Button>
        ) : null}
      </div>
    </div>
  );
}
