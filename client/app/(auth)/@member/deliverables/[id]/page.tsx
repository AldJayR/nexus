import { notFound, unauthorized } from "next/navigation";
import { Suspense } from "react";
import { DeliverableDetails } from "@/components/shared/deliverables";
import { getDeliverableDetail } from "@/lib/data/deliverables";
import { auth } from "@/auth";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function MemberDeliverableDetailPage({ params }: PageProps) {
  const session = await auth();

  // HARD GATE: Member only
  if (session?.user?.role !== "member") {
    return unauthorized();
  }

	const { id } = await params;

	const { deliverable, evidence, phase } = await getDeliverableDetail(id);

	if (!deliverable) {
		notFound();
	}

	return (
		<Suspense fallback={<div className="py-8 text-center">Loading deliverable...</div>}>
			<DeliverableDetails
				canReview={false}
				deliverable={deliverable}
				evidence={evidence}
				isPending={false}
				phase={phase}
			/>
		</Suspense>
	);
}
