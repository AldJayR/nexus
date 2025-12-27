import { Calendar, ChevronLeftIcon, FileIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status";
import { formatDate } from "@/lib/helpers/format-date";
import type { Deliverable, Evidence, Phase } from "@/lib/types";
import { DeliverableStatus } from "@/lib/types";
import { isDeliverableOverdue } from "@/lib/types/deliverables-utils";
import { cn } from "@/lib/utils";
import { EmptyState } from "../empty-state";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type DeliverableDetailsProps = {
	deliverable: Deliverable;
	phase?: Phase;
	evidence: Evidence[];
	isPending: boolean;
	canReview: boolean;
	onApprove?: () => void;
	onRequestChanges?: () => void;
};

export function DeliverableDetails({
	deliverable,
	phase,
	evidence,
	isPending,
	canReview,
	onApprove,
	onRequestChanges,
}: DeliverableDetailsProps) {
	const overdue = isDeliverableOverdue(deliverable);
	const showReviewActions =
		canReview && deliverable.status === DeliverableStatus.REVIEW;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<Button
					asChild
					variant="ghost"
				>
					<Link href="/deliverables">
						<ChevronLeftIcon />
						Back to Deliverables
					</Link>
				</Button>
				{showReviewActions ? (
					<div className="flex flex-col gap-4 sm:flex-row">
						{onRequestChanges ? (
							<Button
								className="w-fit"
								disabled={isPending}
								onClick={onRequestChanges}
								variant="outline"
							>
								Request Changes
							</Button>
						) : null}
						{onApprove ? (
							<Button
								className="w-fit"
								disabled={isPending}
								onClick={onApprove}
							>
								Approve
							</Button>
						) : null}
					</div>
				) : null}
			</div>

			<div className="space-y-2">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<h1 className="font-semibold text-2xl">{deliverable.title}</h1>
						<div className="flex items-center gap-2">
							<p className="text-muted-foreground">{phase?.name || "No phase assigned"}</p>
							<div className="flex flex-wrap items-center gap-2">
								<StatusBadge status={deliverable.status} />
								{phase ? <StatusBadge status={phase.type} /> : null}
							</div>
						</div>
					</div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground text-sm">Due Date</p>
            <div
              className={cn(
                "flex items-center gap-2 text-sm",
                overdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Calendar size={16} />
              {deliverable.dueDate ? (
                <span>
                  {overdue ? "Overdue: " : ""}
                  <span className={cn(overdue ? "font-semibold" : "text-foreground")}>
                    {formatDate(deliverable.dueDate)}
                  </span>
                </span>
              ) : null}
            </div>
          </div>
				</div>
        <p className="text-muted-foreground max-w-prose">{deliverable.description}</p>
			</div>

      <Separator />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="space-y-2">
					<h3 className="font-semibold text-foreground text-sm">Evidence Files</h3>
					{evidence.length === 0 ? (
						<EmptyState
							title="No evidence uploaded yet."
							description=""
							icon={FileIcon}
						/>
					) : (
						<div className="space-y-2">
							{evidence.map((item) => (
								<div
									className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2"
									key={item.id}
								>
									<div className="min-w-0">
										<p className="truncate font-medium text-sm">{item.fileName}</p>
										<p className="text-muted-foreground text-xs">
											Uploaded {formatDate(item.createdAt)}
										</p>
									</div>
									<Button
										asChild
										variant="outline"
									>
										<Link
											href={item.fileUrl}
											rel="noreferrer"
											target="_blank"
										>
											View
										</Link>
									</Button>
								</div>
							))}
						</div>
					)}
				</div>
        <div className="space-y-2">
					<h3 className="font-semibold text-foreground text-sm">Comments</h3>
          <ScrollArea>
            {/* comments here. Like a chat showing who(full name), message, and when it was posted */}
          <ScrollBar />
          </ScrollArea>
				</div>
			</div>
		</div>
	);
}
