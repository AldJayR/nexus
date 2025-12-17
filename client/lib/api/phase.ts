import type { Phase, PhaseDetail, PhaseType } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreatePhaseInput = {
  projectId?: string;
  type: PhaseType;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export type UpdatePhaseInput = {
  type?: PhaseType;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export const phaseApi = {
  listPhases: async (): Promise<Phase[]> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.PHASES.LIST);
    return response.data;
  },

  getPhaseById: async (id: string): Promise<PhaseDetail> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.PHASES.GET(id));
    return response.data;
  },

  createPhase: async (data: CreatePhaseInput): Promise<Phase> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.PHASES.CREATE, data);
    return response.data;
  },

  updatePhase: async (id: string, data: UpdatePhaseInput): Promise<Phase> => {
    const client = await createApiClient();
    const response = await client.put(API_ENDPOINTS.PHASES.UPDATE(id), data);
    return response.data;
  },

  deletePhase: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.delete(API_ENDPOINTS.PHASES.DELETE(id));
  },
};
