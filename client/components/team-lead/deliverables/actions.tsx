"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  approveDeliverableAction,
  requestChangesDeliverableAction,
} from "@/actions/deliverables";
import { DeliverableDetails } from "@/components/shared/deliverables";
import { RequestChangesDialog } from "@/components/team-lead/deliverables/request-changes-dialog";
import type { Deliverable, Evidence, Phase } from "@/lib/types";

interface TeamLeadDeliverableActionsProps {
  deliverable: Deliverable;
  evidence: Evidence[];
  phase?: Phase;
}

export default function TeamLeadDeliverableActions({
  deliverable,
  evidence,
  phase,
}: TeamLeadDeliverableActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [requestComment, setRequestComment] = useState("");

  const approve = () => {
    startTransition(async () => {
      const result = await approveDeliverableAction({
        deliverableId: deliverable.id,
      });
      if (result.success) {
        toast.success("Deliverable approved");
        router.push(`/deliverables/${deliverable.id}`);
        return;
      }
      toast.error(result.error ?? "Failed to approve deliverable");
    });
  };

  const submitRequestChanges = () => {
    startTransition(async () => {
      const result = await requestChangesDeliverableAction({
        deliverableId: deliverable.id,
        comment: requestComment,
      });

      if (result.success) {
        toast.success("Requested changes");
        setRequestChangesOpen(false);
        setRequestComment("");
        router.push(`/deliverables/${deliverable.id}`);
        return;
      }

      toast.error(result.error ?? "Failed to request changes");
    });
  };

  return (
    <>
      <DeliverableDetails
        deliverable={deliverable}
        evidence={evidence}
        isPending={isPending}
        canReview={true}
        onApprove={approve}
        onRequestChanges={() => {
          setRequestChangesOpen(true);
        }}
        phase={phase}
      />

      <RequestChangesDialog
        comment={requestComment}
        isPending={isPending}
        onCommentChange={setRequestComment}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setRequestChangesOpen(false);
            setRequestComment("");
          }
        }}
        onSubmit={submitRequestChanges}
        open={requestChangesOpen}
      />
    </>
  );
}
