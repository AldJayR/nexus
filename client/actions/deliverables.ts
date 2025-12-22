/**
 * Server Actions for Deliverable Management
 * 
 * This module contains server-side actions for managing deliverables,
 * particularly for approval workflows and feedback submission.
 * 
 * Actions:
 * - approveDeliverableAction: Marks a deliverable as completed
 * - requestChangesDeliverableAction: Requests changes and adds feedback
 * 
 * Security:
 * - These are server actions that should be called from client components
 * - Authorization checks should be implemented at the API layer
 * - Input validation using Zod schemas
 * 
 * @module actions/deliverables
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { commentApi } from "@/lib/api/comment";
import { deliverableApi } from "@/lib/api/deliverable";
import { DeliverableStatus } from "@/lib/types";

/**
 * Schema for approving a deliverable
 * Validates that a valid deliverable ID is provided
 */
const approveSchema = z.object({
  deliverableId: z.string().min(1),
});

/**
 * Schema for requesting changes on a deliverable
 * Validates deliverable ID and comment content
 * Comment is required to provide meaningful feedback
 */
const requestChangesSchema = z.object({
  deliverableId: z.string().min(1),
  comment: z.string().min(1, "Comment is required"),
});

/**
 * Approves a deliverable, marking its status as COMPLETED
 * 
 * Side Effects:
 * - Updates deliverable status to COMPLETED
 * - Revalidates /deliverables and /phases paths for fresh data
 * 
 * @param input - Object containing deliverableId (validated with schema)
 * @returns {success: true} on success, {success: false, error: string} on failure
 */
export async function approveDeliverableAction(input: unknown) {
  try {
    const { deliverableId } = approveSchema.parse(input);

    await deliverableApi.updateDeliverable(deliverableId, {
      status: DeliverableStatus.COMPLETED,
    });

    revalidatePath("/deliverables");
    revalidatePath("/phases");

    return { success: true } as const;
  } catch (error) {
    console.error("[approveDeliverableAction] Error:", error);
    return { success: false, error: "Failed to approve deliverable" } as const;
  }
}

/**
 * Requests changes on a deliverable and adds feedback comment
 * 
 * Side Effects:
 * - Reverts deliverable status to IN_PROGRESS
 * - Creates a new comment with the feedback
 * - Revalidates /deliverables and /phases paths for fresh data
 * 
 * @param input - Object with deliverableId and comment (validated with schema)
 * @returns {success: true} on success, {success: false, error: string} on failure
 */
export async function requestChangesDeliverableAction(input: unknown) {
  try {
    const { deliverableId, comment } = requestChangesSchema.parse(input);

    await Promise.all([
      deliverableApi.updateDeliverable(deliverableId, {
        status: DeliverableStatus.IN_PROGRESS,
      }),
      commentApi.createComment({ deliverableId, content: comment }),
    ]);

    revalidatePath("/deliverables");
    revalidatePath("/phases");

    return { success: true } as const;
  } catch (error) {
    console.error("[requestChangesDeliverableAction] Error:", error);
    return {
      success: false,
      error: "Failed to request changes",
    } as const;
  }
}
