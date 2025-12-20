"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { DateValue, RangeValue } from "react-aria-components";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createSprintAction } from "@/actions/sprints";
import DateRange from "@/components/shared/date-range";
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
import { createSprintSchema } from "@/lib/validation";

type CreateSprintDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateSprintDialog({
  open,
  onOpenChange,
}: CreateSprintDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof createSprintSchema>>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: {
      goal: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = (values: z.infer<typeof createSprintSchema>) => {
    onOpenChange(false);

    startTransition(async () => {
      const result = await createSprintAction(values);

      if (result.success) {
        toast.success("Sprint created");
        router.refresh();
        form.reset();
      } else {
        toast.error(result.error || "Failed to create sprint");
        onOpenChange(true);
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Sprint</DialogTitle>
          <DialogDescription>
            Create a new sprint with a goal and date range.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What should be achieved in this sprint"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Start and End Dates</FormLabel>
                    <FormControl>
                      <DateRange
                        onChange={(range: RangeValue<DateValue> | null) => {
                          if (!range) {
                            form.setValue("startDate", "");
                            form.setValue("endDate", "");
                            return;
                          }

                          form.setValue("startDate", range.start.toString());
                          form.setValue("endDate", range.end.toString());
                        }}
                        value={
                          form.getValues("startDate") &&
                          form.getValues("endDate")
                            ? {
                                start: parseDate(form.getValues("startDate")),
                                end: parseDate(form.getValues("endDate")),
                              }
                            : null
                        }
                      />
                    </FormControl>
                    {fieldState.invalid ? (
                      <p className="mt-1 text-destructive text-sm">
                        {fieldState.error?.message}
                      </p>
                    ) : null}
                  </FormItem>
                )}
              />
            </div>

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
                {isPending ? "Creating..." : "Create Sprint"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
