"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/ui/status";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/lib/helpers/format-date";
import type { Deliverable, Evidence, Phase } from "@/lib/types";
import { DeliverableStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isDeliverableOverdue } from "./deliverables-utils";

type DeliverableDetailsProps = {
  deliverable: Deliverable;
  phase?: Phase;
  evidenceCount: number;
  evidence: Evidence[];
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewEvidence?: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
};

export function DeliverableDetails({
  deliverable,
  phase,
  evidence,
  isPending,
  open,
  onOpenChange,
  onApprove,
  onRequestChanges,
}: DeliverableDetailsProps) {
  const isMobile = useIsMobile();
  const overdue = isDeliverableOverdue(deliverable);

  const handleClose = () => {
    onOpenChange(false);
  };

  const renderBadges = () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status={deliverable.status} />
      {phase ? <StatusBadge status={phase.type} /> : null}
    </div>
  );

  const renderDescription = () => {
    if (!deliverable.description) {
      return null;
    }
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground text-sm">Description</h3>
        <p className="text-muted-foreground text-sm">
          {deliverable.description}
        </p>
      </div>
    );
  };

  const renderDueDate = () => {
    if (!deliverable.dueDate) {
      return null;
    }
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground text-sm">Due Date</h3>
        <div
          className={cn(
            "flex items-center gap-2 text-sm",
            overdue ? "text-destructive" : "text-muted-foreground"
          )}
        >
          <Calendar size={16} />
          <span>
            {overdue ? "Overdue: " : ""}
            <span className={cn(overdue ? "font-semibold" : "text-foreground")}>
              {formatDate(deliverable.dueDate)}
            </span>
          </span>
        </div>
      </div>
    );
  };

  const renderEvidence = () => (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground text-sm">Evidence Files</h3>
      {evidence.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No evidence uploaded yet.
        </p>
      ) : (
        <div className="space-y-2">
          {evidence.map((item) => (
            <div
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
              key={item.id}
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{item.fileName}</p>
                <p className="text-muted-foreground text-xs">
                  Uploaded {formatDate(item.createdAt)}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={item.fileUrl} rel="noreferrer" target="_blank">
                  View
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ContentComponent = () => (
    <>
      <div className="grid flex-1 auto-rows-min gap-6 px-4">
        {renderBadges()}
        {renderDescription()}
        {renderDueDate()}
        {renderEvidence()}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {deliverable.status === DeliverableStatus.REVIEW ? (
          <>
            <Button
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={onRequestChanges}
              type="button"
              variant="outline"
            >
              Request Changes
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={() => {
                onApprove();
                handleClose();
              }}
              type="button"
            >
              Approve
            </Button>
          </>
        ) : null}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-xl">{deliverable.title}</DrawerTitle>
            <DrawerDescription className="text-base">
              {phase?.name || "No phase assigned"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="mb-32">
            <ContentComponent />
          </div>

          <DrawerFooter className="flex-col gap-2">
            {deliverable.status === DeliverableStatus.REVIEW ? (
              <>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isPending}
                  onClick={onRequestChanges}
                  type="button"
                  variant="outline"
                >
                  Request Changes
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isPending}
                  onClick={() => {
                    onApprove();
                    handleClose();
                  }}
                  type="button"
                >
                  Approve
                </Button>
              </>
            ) : null}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="mt-4">
          <SheetTitle className="text-xl">{deliverable.title}</SheetTitle>
          <SheetDescription className="text-base">
            {phase?.name || "No phase assigned"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <ContentComponent />
        </div>

        <SheetFooter className="flex-col justify-end gap-2 sm:flex-row">
          {deliverable.status === DeliverableStatus.REVIEW ? (
            <>
              <Button
                className="w-full sm:w-auto"
                disabled={isPending}
                onClick={onRequestChanges}
                type="button"
                variant="outline"
              >
                Request Changes
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={isPending}
                onClick={() => {
                  onApprove();
                  handleClose();
                }}
                type="button"
              >
                Approve
              </Button>
            </>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
