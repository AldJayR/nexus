"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  createDeliverableAction,
  updateDeliverableAction,
} from "@/actions/phases";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Deliverable, DeliverableStatus } from "@/lib/types";
import { deliverableSchema } from "@/lib/validation";

type DeliverableDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phaseId: string | null;
  deliverable: Deliverable | null;
};

export function DeliverableDialog({
  open,
  onOpenChange,
  phaseId,
  deliverable,
}: DeliverableDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!deliverable;

  const form = useForm({
    resolver: zodResolver(deliverableSchema),
    defaultValues: {
      title: "",
      dueDate: "",
      description: "",
      status: DeliverableStatus.NOT_STARTED,
    },
  });

  // Populate form when dialog opens with deliverable data
  useEffect(() => {
    if (open && deliverable) {
      form.reset({
        title: deliverable.title,
        dueDate: deliverable.dueDate ? deliverable.dueDate.split("T")[0] : "",
        description: deliverable.description || "",
        status: deliverable.status,
      });
    } else if (open && !deliverable) {
      form.reset({
        title: "",
        dueDate: "",
        description: "",
        status: DeliverableStatus.NOT_STARTED,
      });
    }
  }, [open, deliverable, form]);

  type DeliverableActionResult = Awaited<
    ReturnType<typeof createDeliverableAction>
  >;

  const saveDeliverable = (
    values: z.infer<typeof deliverableSchema>
  ): Promise<DeliverableActionResult> => {
    if (isEditing) {
      if (!deliverable) {
        return Promise.resolve({
          success: false,
          error: "Missing deliverable",
        });
      }

      return updateDeliverableAction({
        id: deliverable.id,
        ...values,
      });
    }

    if (!phaseId) {
      return Promise.resolve({ success: false, error: "Missing phase" });
    }

    return createDeliverableAction({
      phaseId,
      title: values.title,
      dueDate: values.dueDate,
      description: values.description,
    });
  };

  const onSubmit = (values: z.infer<typeof deliverableSchema>) => {
    // Close dialog immediately before async action
    onOpenChange(false);

    startTransition(async () => {
      const result = await saveDeliverable(values);
      if (result.success) {
        toast.success(
          isEditing
            ? "Deliverable updated successfully"
            : "Deliverable created successfully"
        );
        return;
      }
      onOpenChange(true);
      toast.error(result.error || "Failed to save deliverable");
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Deliverable" : "Add Deliverable"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this deliverable."
              : "Create a new deliverable for this phase."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEditing ? (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(DeliverableStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                {(() => {
                  if (isPending) {
                    return "Saving...";
                  }
                  if (isEditing) {
                    return "Save Changes";
                  }
                  return "Create Deliverable";
                })()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
