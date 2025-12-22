import { isDateInPast } from "@/lib/helpers/format-date";
import type { Deliverable, DeliverableStatus } from "@/lib/types";

export function isDeliverableOverdue(deliverable: Deliverable): boolean {
  if (!deliverable.dueDate) {
    return false;
  }
  if (deliverable.status === "COMPLETED") {
    return false;
  }
  return isDateInPast(deliverable.dueDate);
}

export function getDeliverableAccentClass(status: DeliverableStatus): string {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-blue-500";
    case "REVIEW":
      return "bg-purple-500";
    case "COMPLETED":
      return "bg-green-500";
    default:
      return "bg-slate-500";
  }
}
