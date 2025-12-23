"use client";

import { Calendar, Paperclip } from "lucide-react";
import { FramePanel } from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status";
import { formatDate } from "@/lib/helpers/format-date";
import type { Deliverable, Phase } from "@/lib/types";
import { isDeliverableOverdue } from "@/lib/types/deliverables-utils";
import { cn } from "@/lib/utils";

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
    <FramePanel
      className="cursor-pointer space-y-4"
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
      <div className="space-y-0">
        <h4 className="w-full truncate font-semibold text-base">
          {deliverable.title}
        </h4>
        <p>
          {phase ? (
            <span className="truncate text-muted-foreground text-sm">
              {phase.name}
            </span>
          ) : null}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={deliverable.status} />
          {phase ? <StatusBadge status={phase.type} /> : null}
        </div>

        <div className="flex items-start justify-between">
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
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Paperclip className="h-3.5 w-3.5" />
            <span>{evidenceCount}</span>
          </div>
        </div>
      </div>
    </FramePanel>
  );
}
