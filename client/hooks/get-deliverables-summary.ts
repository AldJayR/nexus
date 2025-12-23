import type { Deliverable } from "@/lib/types";
import { DeliverableStatus } from "@/lib/types";
import { isDeliverableOverdue } from "@/lib/types/deliverables-utils";

export type DeliverablesSummary = {
  total: number;
  completed: number;
  pendingReview: number;
  inProgress: number;
  notStarted: number;
  overdue: number;
  completedRatio: number;
};

export function getDeliverablesSummary(
  deliverables: Deliverable[]
): DeliverablesSummary {
  const total = deliverables.length;
  const completed = deliverables.filter(
    (d) => d.status === DeliverableStatus.COMPLETED
  ).length;
  const pendingReview = deliverables.filter(
    (d) => d.status === DeliverableStatus.REVIEW
  ).length;
  const inProgress = deliverables.filter(
    (d) => d.status === DeliverableStatus.IN_PROGRESS
  ).length;
  const notStarted = deliverables.filter(
    (d) => d.status === DeliverableStatus.NOT_STARTED
  ).length;
  const overdue = deliverables.filter((d) => isDeliverableOverdue(d)).length;
  const completedRatio = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pendingReview,
    inProgress,
    notStarted,
    overdue,
    completedRatio,
  };
}
