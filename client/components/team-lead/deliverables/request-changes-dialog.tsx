"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export type RequestChangesDialogProps = {
  comment: string;
  isPending: boolean;
  open: boolean;
  onCommentChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
};

export function RequestChangesDialog({
  comment,
  isPending,
  open,
  onCommentChange,
  onOpenChange,
  onSubmit,
}: RequestChangesDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Changes</DialogTitle>
          <DialogDescription>
            Add feedback so the team knows what to fix.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Feedback comment"
          rows={3}
          value={comment}
        />

        <DialogFooter>
          <Button
            disabled={isPending || comment.trim() === ""}
            onClick={onSubmit}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
