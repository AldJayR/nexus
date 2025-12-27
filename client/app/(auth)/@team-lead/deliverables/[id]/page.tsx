import { notFound, unauthorized } from "next/navigation";
import { Suspense } from "react";
import { getDeliverableDetail } from "@/lib/data/deliverables";
import TeamLeadDeliverableActions from "@/components/team-lead/deliverables/actions";
import { auth } from "@/auth";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeamLeadDeliverableDetailPage({
  params,
}: PageProps) {
  const session = await auth();
  
  // HARD GATE: Team Lead only
  if (session?.user?.role !== "teamLead") {
    return unauthorized();
  }

  const { id } = await params;

  const { deliverable, evidence, phase } =
  await getDeliverableDetail(id);

  if (!deliverable) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="py-8 text-center">Loading deliverable...</div>}>
      <TeamLeadDeliverableActions
        deliverable={deliverable}
        evidence={evidence}
        phase={phase}
      />
    </Suspense>
  );
}
