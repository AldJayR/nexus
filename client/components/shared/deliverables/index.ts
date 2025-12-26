/**
 * Shared Deliverables Components
 *
 * Core, role-agnostic components for displaying and managing deliverables.
 * Used across Team Lead, Member, and Adviser roles.
 *
 * - DeliverableCard: Display deliverable with status and metadata
 * - DeliverableDetails: Detail view (modal/drawer) for deliverables
 * - EvidenceDialog: Display uploaded evidence files
 * - DeliverablesFilters: Search and filter deliverables by phase/status
 * - DeliverablesSummaryCards: Summary statistics and timeline
 */

export type { DeliverableCardProps } from "./deliverable-card";
export { DeliverableCard } from "./deliverable-card";

export { DeliverableDetails } from "./deliverable-details";
export type { EvidenceDialogProps } from "./evidence-dialog";
export { EvidenceDialog } from "./evidence-dialog";

export { DeliverablesFilters } from "./filters";

export { DeliverablesSummaryCards } from "./summary-cards";
