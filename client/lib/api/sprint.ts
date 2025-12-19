import type { Sprint, SprintProgress } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateSprintInput = {
  projectId?: string;
  goal: string;
  startDate: string;
  endDate: string;
};

export type UpdateSprintInput = {
  goal?: string;
  startDate?: string;
  endDate?: string;
};

export const sprintApi = {
  listSprints: async (): Promise<Sprint[]> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.SPRINTS.LIST);
    return response.data;
  },

  getSprintById: async (id: string): Promise<Sprint> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.SPRINTS.GET(id));
    return response.data;
  },

  createSprint: async (data: CreateSprintInput): Promise<Sprint> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.SPRINTS.CREATE, data);
    return response.data;
  },

  updateSprint: async (
    id: string,
    data: UpdateSprintInput
  ): Promise<Sprint> => {
    const client = await createApiClient();
    const response = await client.put(API_ENDPOINTS.SPRINTS.UPDATE(id), data);
    return response.data;
  },

  deleteSprint: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.delete(API_ENDPOINTS.SPRINTS.DELETE(id));
  },

  restoreSprint: async (id: string): Promise<Sprint> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.SPRINTS.RESTORE(id));
    return response.data;
  },

  getSprintProgress: async (id: string): Promise<SprintProgress> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.SPRINTS.PROGRESS(id));
    return response.data;
  },
};
