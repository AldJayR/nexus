/**
 * Deliverables Client Component (Team Lead View)
 * 
 * Interactive React component for managing deliverables in the team lead dashboard.
 * Provides features for:
 * - Viewing deliverables with filtering and sorting
 * - Approving completed evidence submissions
 * - Requesting changes with feedback
 * - Viewing evidence history and file uploads
 * 
 * State Management:
 * - phaseFilter: Filter deliverables by phase
 * - statusFilter: Filter by status (not-started, in-progress, review, completed)
 * - viewMode: Toggle between grid and list views
 * - Dialogs for approval and evidence viewing
 * 
 * Permissions:
 * - Can approve deliverables with status=REVIEW
 * - Can request changes and add feedback comments
 * - Can view all uploaded evidence files
 */
"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  approveDeliverableAction,
  requestChangesDeliverableAction,
} from "@/actions/deliverables";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status";
import { formatDate, isDateInPast } from "@/lib/helpers/format-date";
import type { Deliverable, Evidence, Phase } from "@/lib/types";
import { DeliverableStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Eye,
  LayoutGrid,
  List,
  Paperclip,
  Search,
  TriangleAlert,
} from "lucide-react";

/**
 * Props for the DeliverablesClient component
 * @property deliverables - Array of all deliverables
 * @property phases - Array of project phases for filtering
 * @property evidenceByDeliverableId - Map of deliverable IDs to their evidence arrays
 */
type DeliverablesClientProps = {
  deliverables: Deliverable[];
  phases: Phase[];
  evidenceByDeliverableId: Record<string, Evidence[]>;
};

type ViewMode = "grid" | "list";
type PhaseFilter = "ALL" | string;
type StatusFilter = "ALL" | DeliverableStatus;

/**
 * Determines if a deliverable is overdue
 * 
 * Rules:
 * - Not overdue if no dueDate set
 * - Not overdue if status is COMPLETED
 * - Overdue if current date is after dueDate
 */
function isOverdue(deliverable: Deliverable): boolean {
  if (!deliverable.dueDate) return false;
  if (deliverable.status === DeliverableStatus.COMPLETED) return false;
  return isDateInPast(deliverable.dueDate);
}

/**
 * Returns Tailwind class for status accent color bar
 * Used as a left border on deliverable cards for visual status indication
 * 
 * Color Mapping:
 * - BLUE: In Progress
 * - PURPLE: In Review
 * - GREEN: Completed
 * - SLATE: Not Started (default)
 */
function getAccentClass(status: DeliverableStatus): string {
  switch (status) {
    case DeliverableStatus.IN_PROGRESS:
      return "bg-blue-500";
    case DeliverableStatus.REVIEW:
      return "bg-purple-500";
    case DeliverableStatus.COMPLETED:
      return "bg-green-500";
    case DeliverableStatus.NOT_STARTED:
    default:
      return "bg-slate-500";
  }
}

export function DeliverablesClient({
  deliverables,
  phases,
  evidenceByDeliverableId,
}: DeliverablesClientProps) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [requestChangesId, setRequestChangesId] = useState<string | null>(null);
  const [requestComment, setRequestComment] = useState("");
  const [evidenceDialogId, setEvidenceDialogId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isPending, startTransition] = useTransition();

  const phaseById = useMemo(() => {
    return Object.fromEntries(phases.map((phase) => [phase.id, phase] as const));
  }, [phases]);

  const stats = useMemo(() => {
    const total = deliverables.length;
    const completed = deliverables.filter((d) => d.status === DeliverableStatus.COMPLETED)
      .length;
    const pendingReview = deliverables.filter((d) => d.status === DeliverableStatus.REVIEW)
      .length;
    const overdue = deliverables.filter((d) => isOverdue(d)).length;
    const completedRatio = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pendingReview, overdue, completedRatio };
  }, [deliverables]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deliverables
      .filter((d) => (phaseFilter === "ALL" ? true : d.phaseId === phaseFilter))
      .filter((d) => (statusFilter === "ALL" ? true : d.status === statusFilter))
      .filter((d) => (q ? d.title.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
        return aDue - bDue;
      });
  }, [deliverables, phaseFilter, query, statusFilter]);

  const approve = (deliverableId: string) => {
    startTransition(async () => {
      const result = await approveDeliverableAction({ deliverableId });
      if (result.success) {
        toast.success("Deliverable approved");
        return;
      }
      toast.error(result.error ?? "Failed to approve deliverable");
    });
  };

  const openRequestChanges = (deliverableId: string) => {
    setRequestChangesId(deliverableId);
    setRequestComment("");
  };

  const submitRequestChanges = () => {
    if (!requestChangesId) return;

    startTransition(async () => {
      const result = await requestChangesDeliverableAction({
        deliverableId: requestChangesId,
        comment: requestComment,
      });

      if (result.success) {
        toast.success("Requested changes");
        setRequestChangesId(null);
        setRequestComment("");
        return;
      }

      toast.error(result.error ?? "Failed to request changes");
    });
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <CardDescription>Total Deliverables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <CardDescription>Completed</CardDescription>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">{stats.completed}</div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${stats.completedRatio}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <CardDescription>Pending Review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingReview}</div>
            <div className="text-xs text-muted-foreground">Needs attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <CardDescription>Overdue</CardDescription>
            <TriangleAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overdue}</div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deliverables"
            value={query}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            onValueChange={(value) => setPhaseFilter(value)}
            value={phaseFilter}
          >
            <SelectTrigger className="w-45">
              <SelectValue placeholder="All phases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All phases</SelectItem>
              {phases.map((phase) => (
                <SelectItem key={phase.id} value={phase.id}>
                  {phase.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) =>
              setStatusFilter(value === "ALL" ? "ALL" : (value as DeliverableStatus))
            }
            value={statusFilter}
          >
            <SelectTrigger className="w-45">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {Object.values(DeliverableStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center rounded-lg border bg-background p-1">
            <Button
              aria-label="Grid view"
              className={cn("h-8 w-8", viewMode === "grid" ? "bg-muted" : "")}
              onClick={() => setViewMode("grid")}
              size="icon"
              type="button"
              variant="ghost"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              aria-label="List view"
              className={cn("h-8 w-8", viewMode === "list" ? "bg-muted" : "")}
              onClick={() => setViewMode("list")}
              size="icon"
              type="button"
              variant="ghost"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground text-sm">
          No deliverables found.
        </div>
      ) : (
        <section
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
              : "grid grid-cols-1 gap-4"
          )}
        >
          {filtered.map((deliverable) => {
            const phase = phaseById[deliverable.phaseId];
            const evidence = evidenceByDeliverableId[deliverable.id] ?? [];
            const overdue = isOverdue(deliverable);

            return (
              <Card className="relative overflow-hidden" key={deliverable.id}>
                <div className={cn("absolute inset-y-0 left-0 w-1", getAccentClass(deliverable.status))} />

                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="truncate text-base">
                        {deliverable.title}
                      </CardTitle>
                      <CardDescription>
                        {phase ? (
                          <span className="inline-flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{phase.type}</Badge>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="truncate">{phase.name}</span>
                          </span>
                        ) : null}
                      </CardDescription>
                    </div>

                    <StatusBadge status={deliverable.status} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {deliverable.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
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
                      <Calendar className="h-4 w-4" />
                      <span>
                        Due <span className={cn(overdue ? "font-semibold" : "text-foreground")}>{formatDate(deliverable.dueDate)}</span>
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Paperclip className="h-3.5 w-3.5" />
                        <span>{evidence.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        aria-label="View evidence"
                        onClick={() => setEvidenceDialogId(deliverable.id)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {deliverable.status === DeliverableStatus.REVIEW ? (
                        <>
                          <Button
                            disabled={isPending}
                            onClick={() => approve(deliverable.id)}
                            size="sm"
                            type="button"
                          >
                            Approve
                          </Button>
                          <Button
                            disabled={isPending}
                            onClick={() => openRequestChanges(deliverable.id)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            Request Changes
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <Dialog
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setRequestChangesId(null);
            setRequestComment("");
          }
        }}
        open={requestChangesId !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Add feedback so the team knows what to fix.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Input
              onChange={(e) => setRequestComment(e.target.value)}
              placeholder="Feedback comment"
              value={requestComment}
            />
          </div>

          <DialogFooter>
            <Button
              disabled={isPending || requestComment.trim() === ""}
              onClick={submitRequestChanges}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setEvidenceDialogId(null);
          }
        }}
        open={evidenceDialogId !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evidence</DialogTitle>
            <DialogDescription>
              Files uploaded for this deliverable.
            </DialogDescription>
          </DialogHeader>

          {evidenceDialogId ? (
            (() => {
              const evidence = evidenceByDeliverableId[evidenceDialogId] ?? [];
              if (evidence.length === 0) {
                return (
                  <div className="py-6 text-center text-muted-foreground text-sm">
                    No evidence uploaded yet.
                  </div>
                );
              }
              return (
                <div className="space-y-2">
                  {evidence.map((item) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                      key={item.id}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-sm">
                          {item.fileName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Uploaded {formatDate(item.createdAt)}
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <a href={item.fileUrl} rel="noreferrer" target="_blank">
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              );
            })()
          ) : null}

          <DialogFooter>
            <Button onClick={() => setEvidenceDialogId(null)} type="button" variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
