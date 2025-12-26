/**
 * Member Deliverables Page
 *
 * Server component for team members to view deliverables.
 * Members can see deliverables for their assigned phases and projects,
 * but cannot approve or request changes (Team Lead only functions).
 *
 * Data Fetching:
 * - Fetch all deliverables
 * - Fetch all phases for reference
 * - Fetch evidence for each deliverable
 *
 * @route /app/(auth)/@member/deliverables
 * @access Member role only
 */

import { MemberDeliverablesClient } from "@/components/member/deliverables/client";
import { deliverableApi } from "@/lib/api/deliverable";
import { evidenceApi } from "@/lib/api/evidence";
import { phaseApi } from "@/lib/api/phase";

export const metadata = {
  title: "Deliverables",
  description: "View and manage your deliverable submissions",
};

export default async function MemberDeliverablesPage() {
  const [deliverables, phases] = await Promise.all([
    deliverableApi.listDeliverables(),
    phaseApi.listPhases(),
  ]);

  const evidenceEntries = await Promise.all(
    deliverables.map(async (deliverable) => {
      try {
        const evidence = await evidenceApi.getEvidenceByDeliverable(
          deliverable.id
        );
        return [deliverable.id, evidence] as const;
      } catch {
        return [deliverable.id, []] as const;
      }
    })
  );

  const evidenceByDeliverableId = Object.fromEntries(evidenceEntries);

  return (
    <MemberDeliverablesClient
      deliverables={deliverables}
      evidenceByDeliverableId={evidenceByDeliverableId}
      phases={phases}
    />
  );
}
