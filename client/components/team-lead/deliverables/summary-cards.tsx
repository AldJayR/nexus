import { TriangleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tracker } from "@/components/ui/tracker";
import { formatTitleCase } from "@/lib/helpers";
import { formatDate } from "@/lib/helpers/format-date";
import type { Deliverable } from "@/lib/types";
import type { DeliverablesSummary } from "./get-deliverables-summary";

const getStatusColor = (status: string): string => {
  switch (status) {
    case "COMPLETED":
    case "DONE":
      return "bg-green-500";
    case "IN_PROGRESS":
      return "bg-blue-500";
    case "REVIEW":
      return "bg-purple-500";
    case "BLOCKED":
      return "bg-red-500";
    case "TODO":
      return "bg-slate-500";
    default:
      return "bg-slate-500";
  }
};

export function DeliverablesSummaryCards({
  summary,
  deliverables = [],
}: {
  summary: DeliverablesSummary;
  deliverables?: Deliverable[];
}) {
  // Sort deliverables by due date
  const sortedDeliverables = [...deliverables].sort((a, b) => {
    const dateA = a.dueDate
      ? new Date(a.dueDate).getTime()
      : Number.POSITIVE_INFINITY;
    const dateB = b.dueDate
      ? new Date(b.dueDate).getTime()
      : Number.POSITIVE_INFINITY;
    return dateA - dateB;
  });

  const trackerData = sortedDeliverables.map((deliverable) => ({
    key: deliverable.id,
    color: getStatusColor(deliverable.status),
    tooltip: `${deliverable.title} - ${formatTitleCase(deliverable.status)}${
      deliverable.dueDate ? ` (Due: ${formatDate(deliverable.dueDate)})` : ""
    }`,
  }));

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardDescription>Total Deliverables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl">{summary.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-start justify-between space-y-0">
          <CardTitle>Overdue</CardTitle>
          <div className="rounded-lg bg-red-100 p-2 dark:bg-red-950">
            <TriangleAlert className="size-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl">{summary.overdue}</div>
          <div className="text-muted-foreground text-xs">Action needed</div>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm">Deliverables Timeline</CardTitle>
          <CardDescription>Sorted by due date</CardDescription>
        </CardHeader>
        <CardContent>
          {trackerData.length === 0 ? (
            <div className="text-muted-foreground text-xs">No deliverables</div>
          ) : (
            <Tracker data={trackerData} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
