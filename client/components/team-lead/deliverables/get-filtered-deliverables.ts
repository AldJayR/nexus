import type { Deliverable, DeliverableStatus } from "@/lib/types";
import type { PhaseFilter, StatusFilter } from "./deliverables-types";

export type DeliverablesFilterInput = {
  deliverables: Deliverable[];
  phaseFilter: PhaseFilter;
  statusFilter: StatusFilter;
  query: string;
};

export function getFilteredDeliverables({
  deliverables,
  phaseFilter,
  statusFilter,
  query,
}: DeliverablesFilterInput): Deliverable[] {
  const normalizedQuery = query.trim().toLowerCase();

  return deliverables
    .filter((deliverable) =>
      phaseFilter === "ALL" ? true : deliverable.phaseId === phaseFilter
    )
    .filter((deliverable) =>
      statusFilter === "ALL"
        ? true
        : deliverable.status === (statusFilter as DeliverableStatus)
    )
    .filter((deliverable) =>
      normalizedQuery
        ? deliverable.title.toLowerCase().includes(normalizedQuery)
        : true
    )
    .sort((a, b) => {
      const aDue = a.dueDate
        ? new Date(a.dueDate).getTime()
        : Number.POSITIVE_INFINITY;
      const bDue = b.dueDate
        ? new Date(b.dueDate).getTime()
        : Number.POSITIVE_INFINITY;
      return aDue - bDue;
    });
}
