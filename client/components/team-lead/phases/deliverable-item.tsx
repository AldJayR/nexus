"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteDeliverableAction } from "@/actions/phases";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status";
import { formatRelativeDueDate, isDateInPast } from "@/lib/helpers/format-date";
import { type Deliverable } from "@/lib/types";
import { cn } from "@/lib/utils";

type DeliverableItemProps = {
  deliverables: Deliverable[];
  onEdit: (deliverable: Deliverable) => void;
};

export function DeliverableItem({
  deliverables,
  onEdit,
}: DeliverableItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    const result = await deleteDeliverableAction(id);
    setIsDeleting(null);
    if (result.success) {
      router.refresh();
    }
  };

  if (deliverables.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground text-sm">
        No deliverables yet.
      </div>
    );
  }

  return (
    <>
      <AlertDialog
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setConfirmDeleteId(null);
          }
        }}
        open={confirmDeleteId !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete deliverable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this deliverable?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmDeleteId === null || isDeleting !== null}
              onClick={async () => {
                if (!confirmDeleteId) {
                  return;
                }
                const id = confirmDeleteId;
                setConfirmDeleteId(null);
                await handleDelete(id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-2">
        {deliverables.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={item.status} />
                {item.dueDate ? (
                  <span
                    className={cn(
                      "text-muted-foreground text-xs",
                      isDateInPast(item.dueDate) && "text-destructive"
                    )}
                  >
                    {formatRelativeDueDate(item.dueDate)}
                  </span>
                ) : null}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="shrink-0"
                  size="icon"
                  variant="ghost"
                >
                  <MoreHorizontal size={16} />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil size={16} />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={isDeleting === item.id}
                  onClick={() => setConfirmDeleteId(item.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </>
  );
}
