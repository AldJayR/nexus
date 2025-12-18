"use client";

import { parseDate } from "@internationalized/date";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateValue, RangeValue } from "react-aria-components";
import {
  Controller,
  useFieldArray,
  type useForm,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MethodologyInput } from "@/lib/validation/project-config";
import DateRange from "./date-range";
import DeliverableDialog from "./deliverable-dialog";
import { emptyDeliverable, type PhaseKey } from "./methodology";

export default function PhaseFields({
  getPhaseValues,
  onDialogOpenChange,
  phaseKey,
  control,
  isPending,
}: {
  getPhaseValues: () => MethodologyInput["phases"][PhaseKey];
  onDialogOpenChange: (open: boolean) => void;
  phaseKey: PhaseKey;
  control: ReturnType<typeof useForm<MethodologyInput>>["control"];
  isPending: boolean;
}) {
  const deliverables = useFieldArray({
    control,
    name: `phases.${phaseKey}.deliverables`,
  });

  const [deliverableDialogOpen, setDeliverableDialogOpen] = useState(false);
  const [deliverableDialogIndex, setDeliverableDialogIndex] = useState<
    number | null
  >(null);

  const deliverablesValues =
    useWatch({
      control,
      name: `phases.${phaseKey}.deliverables`,
    }) ?? [];

  const visibleDeliverables = useMemo(
    () =>
      deliverables.fields
        .map((field, index) => ({
          field,
          index,
          value: deliverablesValues[index],
        }))
        .filter((item) => !item.value?.deletedAt),
    [deliverables.fields, deliverablesValues]
  );

  const dialogDefaults = useMemo(() => {
    if (deliverableDialogIndex === null) {
      return emptyDeliverable;
    }

    const current = deliverablesValues[deliverableDialogIndex];
    return {
      title: current?.title ?? "",
      description: current?.description ?? "",
      dueDate: current?.dueDate ?? "",
    };
  }, [deliverableDialogIndex, deliverablesValues]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name={`phases.${phaseKey}.title`}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="font-medium" htmlFor={field.name}>
                Title
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id={field.name}
                placeholder="Enter phase title"
                required
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          control={control}
          name={`phases.${phaseKey}.dateRange`}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="font-medium" htmlFor={field.name}>
                Start and End Dates
              </FieldLabel>
              <DateRange
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id={field.name}
                onChange={(range: RangeValue<DateValue> | null) => {
                  if (!range) {
                    field.onChange({ start: "", end: "" });
                    return;
                  }

                  field.onChange({
                    start: range.start.toString(),
                    end: range.end.toString(),
                  });
                }}
                value={
                  field.value?.start && field.value?.end
                    ? {
                        start: parseDate(field.value.start),
                        end: parseDate(field.value.end),
                      }
                    : null
                }
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </div>

      <Controller
        control={control}
        name={`phases.${phaseKey}.description`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="font-medium" htmlFor={field.name}>
              Description
            </FieldLabel>
            <Textarea
              {...field}
              aria-invalid={fieldState.invalid}
              disabled={isPending}
              id={field.name}
              placeholder="Enter phase description"
              required
              rows={3}
            />
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </Field>
        )}
      />

      <FieldGroup>
        <div className="flex items-center justify-between gap-3">
          <FieldLabel className="font-medium">Deliverables</FieldLabel>
          <Button
            disabled={isPending}
            onClick={() => {
              setDeliverableDialogIndex(null);
              setDeliverableDialogOpen(true);
              onDialogOpenChange(true);
            }}
            type="button"
            variant="outline"
          >
            Add Deliverable
          </Button>
        </div>

        <DeliverableDialog
          defaultValues={dialogDefaults}
          description={
            deliverableDialogIndex === null
              ? "Create a new deliverable for this phase."
              : "Update the selected deliverable."
          }
          onOpenChange={(open) => {
            setDeliverableDialogOpen(open);
            onDialogOpenChange(open);
          }}
          onSubmit={(values) => {
            if (deliverableDialogIndex === null) {
              deliverables.append({
                title: values.title,
                description: values.description ?? "",
                dueDate: values.dueDate ?? "",
                deletedAt: "",
              });
              return;
            }

            const current = deliverablesValues[deliverableDialogIndex];
            deliverables.update(deliverableDialogIndex, {
              ...current,
              title: values.title,
              description: values.description ?? "",
              dueDate: values.dueDate ?? "",
            });
          }}
          open={deliverableDialogOpen}
          title={
            deliverableDialogIndex === null
              ? "Add Deliverable"
              : "Edit Deliverable"
          }
        />

        {visibleDeliverables.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No deliverables yet. Add at least one deliverable for this phase.
          </p>
        ) : (
          <div className="space-y-3">
            {visibleDeliverables.map(({ field, index, value }) => (
              <div
                className="flex items-start justify-between gap-3 rounded-lg border p-4"
                key={field.id}
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium text-sm">
                    {value?.title || "Untitled"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {value?.dueDate ? `Due ${value.dueDate}` : "No due date"}
                  </p>
                  {value?.description ? (
                    <p className="line-clamp-2 text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      setDeliverableDialogIndex(index);
                      setDeliverableDialogOpen(true);
                      onDialogOpenChange(true);
                    }}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Pencil />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      const phase = getPhaseValues();
                      const current = phase.deliverables[index];
                      deliverables.update(index, {
                        ...current,
                        deletedAt: new Date().toISOString(),
                      });
                    }}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </FieldGroup>
    </div>
  );
}
