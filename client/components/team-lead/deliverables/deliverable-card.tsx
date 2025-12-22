"use client";

import { Calendar, Paperclip } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status";
import { formatDate } from "@/lib/helpers/format-date";
import type { Deliverable, Phase } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isDeliverableOverdue } from "./deliverables-utils";

export type DeliverableCardProps = {
  deliverable: Deliverable;
  phase?: Phase;
  evidenceCount: number;
  isPending: boolean;
  onCardClick: () => void;
  onViewEvidence: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
};

export function DeliverableCard({
  deliverable,
  phase,
  evidenceCount,
  onCardClick,
}: DeliverableCardProps) {
  const overdue = isDeliverableOverdue(deliverable);

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={deliverable.status} />
            {phase ? <StatusBadge status={phase.type} /> : null}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Paperclip className="h-3.5 w-3.5" />
            <span>{evidenceCount}</span>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <CardTitle className="w-full truncate text-base">
            {deliverable.title}
          </CardTitle>
          <CardDescription>
            {phase ? <span className="truncate">{phase.name}</span> : null}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {deliverable.description ? (
          <p className="line-clamp-2 text-muted-foreground text-sm">
            {deliverable.description}
          </p>
        ) : null}

        {deliverable.dueDate ? (
          <div
            className={cn(
              "flex items-center gap-2 text-sm",
              overdue ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <Calendar size={16} />
            <span>
              Due{" "}
              <span
                className={cn(overdue ? "font-semibold" : "text-foreground")}
              >
                {formatDate(deliverable.dueDate)}
              </span>
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
