"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/helpers/format-date";
import type { Evidence } from "@/lib/types";

export type EvidenceDialogProps = {
  evidence: Evidence[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
};

export function EvidenceDialog({
  evidence,
  open,
  onOpenChange,
  onClose,
}: EvidenceDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Evidence</DialogTitle>
          <DialogDescription>
            Files uploaded for this deliverable.
          </DialogDescription>
        </DialogHeader>

        {evidence.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground text-sm">
            No evidence uploaded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {evidence.map((item) => (
              <div
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                key={item.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">
                    {item.fileName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Uploaded {formatDate(item.createdAt)}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={item.fileUrl} rel="noreferrer" target="_blank">
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
