"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Task, TaskStatus, User } from "@/lib/types";

import { TaskCard } from "./task-card";

export type MobileColumnDef = {
  status: TaskStatus;
  label: string;
};

export type TaskBoardMobileProps = {
  columns: MobileColumnDef[];
  columnsValue: Record<TaskStatus, Task[]>;
  userMap: Record<string, User>;
  isPending: boolean;
  onStatusChange: (task: Task, toStatus: TaskStatus) => void;
  onEditReason: (task: Task) => void;
};

export function TaskBoardMobile({
  columns,
  columnsValue,
  userMap,
  isPending,
  onStatusChange,
  onEditReason,
}: TaskBoardMobileProps) {
  const [sheetTask, setSheetTask] = useState<Task | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openTaskSheet = (task: Task) => {
    setSheetTask(task);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      {columns.map((col) => {
        const columnTasks = columnsValue[col.status] ?? [];

        return (
          <div className="space-y-2" key={col.status}>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <Badge className="text-xs" variant="secondary">
                {columnTasks.length}
              </Badge>
            </div>

            {columnTasks.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground text-xs">
                No tasks
              </p>
            ) : (
              <div className="space-y-2">
                {columnTasks.map((task) => {
                  const assignee = task.assigneeId
                    ? userMap[task.assigneeId]
                    : undefined;

                  return (
                    <div
                      aria-label={`Open ${task.title}`}
                      className="block w-full"
                      key={task.id}
                      onClick={() => openTaskSheet(task)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openTaskSheet(task);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <TaskCard
                        assignee={assignee}
                        interaction="tap"
                        onBlockClick={onEditReason}
                        task={task}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <Sheet
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            setSheetTask(null);
          }
        }}
        open={isSheetOpen}
      >
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{sheetTask?.title ?? "Task"}</SheetTitle>
            <SheetDescription>{sheetTask?.description ?? ""}</SheetDescription>
          </SheetHeader>

          <div className="space-y-2 px-4">
            {columns.map((col) => {
              const isCurrent = sheetTask?.status === col.status;

              return (
                <Button
                  className="w-full"
                  disabled={!sheetTask || isPending}
                  key={col.status}
                  onClick={() => {
                    if (!sheetTask) {
                      return;
                    }
                    onStatusChange(sheetTask, col.status);
                    setIsSheetOpen(false);
                  }}
                  type="button"
                  variant={isCurrent ? "default" : "outline"}
                >
                  {col.label}
                </Button>
              );
            })}
          </div>

          <SheetFooter>
            <Button
              disabled={isPending}
              onClick={() => setIsSheetOpen(false)}
              type="button"
              variant="outline"
            >
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
