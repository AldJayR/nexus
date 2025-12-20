"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import type { Task } from "@/lib/types";
import { updateTaskStatusSchema } from "@/lib/validation";

export type BlockReasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  sprintId: string;
  onSuccess?: () => void;
};

export function BlockReasonDialog({
  open,
  onOpenChange,
  task,
  sprintId,
  onSuccess,
}: BlockReasonDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof updateTaskStatusSchema>>({
    resolver: zodResolver(updateTaskStatusSchema),
    defaultValues: {
      sprintId,
      taskId: "",
      status: "BLOCKED",
      comment: "",
    },
  });

  useEffect(() => {
    if (!(open && task)) {
      return;
    }

    form.reset({
      sprintId,
      taskId: task.id,
      status: "BLOCKED",
      comment: task.lastComment?.content || "",
    });
  }, [open, task, sprintId, form]);

  const onSubmit = (values: z.infer<typeof updateTaskStatusSchema>) => {
    startTransition(async () => {
      const result = await updateTaskStatusAction(values);

      if (result.success) {
        const isEditingExisting = task?.status === "BLOCKED";
        toast.success(isEditingExisting ? "Reason updated" : "Task blocked");
        form.reset();
        onSuccess?.();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update task");
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block Task</DialogTitle>
          <DialogDescription>
            Explain why this task is blocked. This helps the team understand
            dependencies and blockers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g. Waiting for API endpoint from backend team"
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
                {isPending ? "Blocking..." : "Block Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
