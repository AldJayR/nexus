/**
 * Adviser Deliverables Page
 *
 * Read-only view for advisers to monitor deliverables across the project.
 * Advisers can see all deliverables and evidence submissions
 * but cannot approve or request changes (Team Lead only).
 *
 * @route /app/(auth)/@adviser/deliverables
 * @access Adviser role only
 */

import { AdviserDeliverablesClient } from "@/components/adviser/deliverables/client";
import { deliverableApi } from "@/lib/api/deliverable";
import { evidenceApi } from "@/lib/api/evidence";
import { phaseApi } from "@/lib/api/phase";

export const metadata = {
  title: "Deliverables",
  description: "Monitor deliverable submissions across all projects",
};

export default async function AdviserDeliverablesPage() {
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
    <AdviserDeliverablesClient
      deliverables={deliverables}
      evidenceByDeliverableId={evidenceByDeliverableId}
      phases={phases}
    />
  );
}
