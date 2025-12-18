import type { Deliverable, DeliverableStatus } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateDeliverableInput = {
  phaseId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
};

export type UpdateDeliverableInput = {
  title?: string;
  description?: string | null;
  status?: DeliverableStatus;
  dueDate?: string | null;
};

export type DeliverableQuery = {
  phaseId?: string;
};

export const deliverableApi = {
  listDeliverables: async (
    query?: DeliverableQuery
  ): Promise<Deliverable[]> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.DELIVERABLES.LIST, {
      params: query,
    });
    return response.data;
  },

  getDeliverableById: async (id: string): Promise<Deliverable> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.DELIVERABLES.GET(id));
    return response.data;
  },

  createDeliverable: async (
    data: CreateDeliverableInput
  ): Promise<Deliverable> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.DELIVERABLES.CREATE, data);
    return response.data;
  },

  updateDeliverable: async (
    id: string,
    data: UpdateDeliverableInput
  ): Promise<Deliverable> => {
    const client = await createApiClient();
    const response = await client.put(
      API_ENDPOINTS.DELIVERABLES.UPDATE(id),
      data
    );
    return response.data;
  },

  deleteDeliverable: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.delete(API_ENDPOINTS.DELIVERABLES.DELETE(id));
  },

  restoreDeliverable: async (id: string): Promise<Deliverable> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.DELIVERABLES.RESTORE(id));
    return response.data;
  },
};
