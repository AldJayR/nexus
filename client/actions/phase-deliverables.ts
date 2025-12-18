"use server";

import { z } from "zod";

import { createApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ServerActionResponse } from "@/lib/types";
import { methodologyPhaseSchema } from "@/lib/validation/project-config";

const phaseKeySchema = z.enum(["waterfall", "scrum", "fall"]);

type PhaseListItem = {
  id: string;
  projectId: string;
  type: "WATERFALL" | "SCRUM" | "FALL";
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type PhaseDetail = PhaseListItem & {
  deliverables: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    dueDate?: string | null;
    deletedAt?: string | null;
  }>;
};

function toIsoDateTimeOrUndefined(dateOnly: string): string | undefined {
  if (!dateOnly) {
    return;
  }
  return `${dateOnly}T00:00:00.000Z`;
}

function dueDateKeyFromIsoOrDateOnly(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  // Accept either YYYY-MM-DD or full ISO datetime, normalize to YYYY-MM-DD
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function deliverableKey(
  title: string,
  dueDate: string | null | undefined
): string {
  return `${title.trim().toLowerCase()}|${dueDateKeyFromIsoOrDateOnly(dueDate)}`;
}

export async function savePhaseDeliverables(
  input: unknown
): Promise<ServerActionResponse<{ phaseId: string }>> {
  // TODO: Fix activity log foreign key issue - userId from request.user doesn't exist in User table
  // Workaround: wrapped createActivityLog calls in try-catch to make logging non-critical
  // Future: Create system/default user or make userId optional in ActivityLog schema

  const inputSchema = z.object({
    phaseKey: phaseKeySchema,
    phaseData: methodologyPhaseSchema,
    projectId: z.string().optional(),
  });

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { phaseKey, phaseData, projectId } = parsed.data;

  try {
    const client = await createApiClient();

    // 1) Upsert phase using server routes:
    //    GET /phases -> find existing by type (+ optional projectId)
    //    POST /phases if missing
    //    PUT /phases/:id if exists
    const phasesResponse = await client.get(API_ENDPOINTS.PHASES.LIST);
    const phases = phasesResponse.data as PhaseListItem[];

    const phaseType: PhaseListItem["type"] =
      phaseKey === "waterfall"
        ? "WATERFALL"
        : phaseKey === "scrum"
          ? "SCRUM"
          : "FALL";

    const existingPhase = phases.find((p) => {
      if (p.type !== phaseType) {
        return false;
      }
      if (!projectId) {
        return true;
      }
      return p.projectId === projectId;
    });

    const startDate = toIsoDateTimeOrUndefined(phaseData.dateRange.start);
    const endDate = toIsoDateTimeOrUndefined(phaseData.dateRange.end);

    let phaseId: string;
    if (existingPhase) {
      const updatePayload = {
        name: phaseData.title,
        description: phaseData.description,
        startDate,
        endDate,
      };

      const updated = await client.put(
        API_ENDPOINTS.PHASES.UPDATE(existingPhase.id),
        updatePayload
      );
      phaseId = (updated.data as { id: string }).id;
    } else {
      const createPayload = {
        projectId,
        type: phaseType,
        name: phaseData.title,
        description: phaseData.description,
        startDate,
        endDate,
      };

      const created = await client.post(
        API_ENDPOINTS.PHASES.CREATE,
        createPayload
      );
      phaseId = (created.data as { id: string }).id;
    }

    // 2) Sync deliverables using server routes:
    //    GET /phases/:id includes deliverables
    //    PUT /deliverables/:id to update
    //    POST /deliverables to create
    //    DELETE /deliverables/:id to remove
    const phaseDetailResponse = await client.get(
      API_ENDPOINTS.PHASES.GET(phaseId)
    );
    const phaseDetail = phaseDetailResponse.data as PhaseDetail;
    const existingDeliverables = phaseDetail.deliverables ?? [];

    const incomingActive = phaseData.deliverables.filter((d) => !d.deletedAt);
    const incomingDeleted = phaseData.deliverables.filter((d) => d.deletedAt);

    const incomingActiveKeys = new Set(
      incomingActive.map((d) => deliverableKey(d.title, d.dueDate ?? ""))
    );
    const incomingDeletedKeys = new Set(
      incomingDeleted.map((d) => deliverableKey(d.title, d.dueDate ?? ""))
    );

    const existingByKey = new Map<
      string,
      PhaseDetail["deliverables"][number]
    >();
    for (const existing of existingDeliverables) {
      existingByKey.set(
        deliverableKey(existing.title, existing.dueDate ?? null),
        existing
      );
    }

    // Deletes: anything explicitly deleted, or removed from the active list
    await Promise.all(
      existingDeliverables.map(async (existing) => {
        const key = deliverableKey(existing.title, existing.dueDate ?? null);
        const shouldDelete =
          incomingDeletedKeys.has(key) || !incomingActiveKeys.has(key);
        if (!shouldDelete) {
          return;
        }
        try {
          await client.delete(API_ENDPOINTS.DELIVERABLES.DELETE(existing.id));
        } catch (error: unknown) {
          // Ignore 404 errors when deleting non-existent deliverables
          // (e.g., deliverables created in form but not yet saved to DB)
          const axiosError = error as { response?: { status: number } };
          if (axiosError.response?.status === 404) {
            return;
          }
          throw error;
        }
      })
    );

    // Upserts for active items: update if matched by key, else create
    await Promise.all(
      incomingActive.map(async (deliverable) => {
        const key = deliverableKey(
          deliverable.title,
          deliverable.dueDate ?? ""
        );
        const existing = existingByKey.get(key);

        const dueDate = deliverable.dueDate
          ? (toIsoDateTimeOrUndefined(deliverable.dueDate) ?? null)
          : null;

        if (existing) {
          const needsUpdate =
            (existing.description ?? "") !== (deliverable.description ?? "") ||
            dueDateKeyFromIsoOrDateOnly(existing.dueDate ?? null) !==
              dueDateKeyFromIsoOrDateOnly(deliverable.dueDate ?? null) ||
            existing.title !== deliverable.title;

          if (!needsUpdate) {
            return;
          }

          await client.put(API_ENDPOINTS.DELIVERABLES.UPDATE(existing.id), {
            title: deliverable.title,
            description: deliverable.description ?? "",
            dueDate,
          });
          return;
        }

        await client.post(API_ENDPOINTS.DELIVERABLES.CREATE, {
          phaseId,
          title: deliverable.title,
          description: deliverable.description ?? "",
          dueDate,
        });
      })
    );

    return { success: true, data: { phaseId } };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to save phase deliverables";
    return { success: false, error: message };
  }
}
