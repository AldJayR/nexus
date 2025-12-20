"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { updateTaskStatusAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { TaskStatus } from "@/lib/types";
import { updateTaskStatusSchema } from "@/lib/validation";

type BlockedReasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  sprintId: string;
  targetStatus: TaskStatus;
  onSuccess?: () => void;
};

export function BlockedReasonDialog({
  open,
  onOpenChange,
  taskId,
  sprintId,
  targetStatus,
  onSuccess,
}: BlockedReasonDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof updateTaskStatusSchema>>({
    resolver: zodResolver(updateTaskStatusSchema),
    defaultValues: {
      taskId: "",
      sprintId,
      status: targetStatus,
      comment: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      taskId: taskId ?? "",
      sprintId,
      status: targetStatus,
      comment: "",
    });
  }, [open, taskId, sprintId, targetStatus, form]);

  const onSubmit = (values: z.infer<typeof updateTaskStatusSchema>) => {
    if (!taskId) {
      return;
    }

    startTransition(async () => {
      const result = await updateTaskStatusAction({
        ...values,
        taskId,
        sprintId,
        status: targetStatus,
      });

      if (result.success) {
        toast.success("Task updated");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update task");
      }
    });
  };

  const isBlocked = targetStatus === "BLOCKED";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBlocked ? "Block Task" : "Update Task"}</DialogTitle>
          <DialogDescription>
            {isBlocked
              ? "Add a reason so others can unblock quickly."
              : "Provide an optional note."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBlocked ? "Reason" : "Note"}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={
                        isBlocked ? "Why is this blocked?" : "Optional"
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
