import type { Evidence } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const evidenceApi = {
  uploadEvidence: async (
    deliverableId: string,
    file: File
  ): Promise<Evidence> => {
    const client = await createApiClient();
    const formData = new FormData();
    formData.append("deliverableId", deliverableId);
    formData.append("file", file);

    const response = await client.post(
      API_ENDPOINTS.EVIDENCE.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getEvidenceByDeliverable: async (
    deliverableId: string
  ): Promise<Evidence[]> => {
    const client = await createApiClient();
    const response = await client.get(
      API_ENDPOINTS.EVIDENCE.BY_DELIVERABLE(deliverableId)
    );
    return response.data;
  },

  deleteEvidence: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.delete(API_ENDPOINTS.EVIDENCE.DELETE(id));
  },
};
