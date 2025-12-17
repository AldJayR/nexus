import type { Project } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateProjectInput = {
  name: string;
  description?: string;
  repositoryUrl?: string;
  startDate: string;
  endDate?: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string;
  repositoryUrl?: string;
  startDate?: string;
  endDate?: string;
};

export const projectApi = {
  getProject: async (): Promise<Project> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.PROJECT.GET);
    return response.data;
  },

  createProject: async (data: CreateProjectInput): Promise<Project> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.PROJECT.CREATE, data);
    return response.data;
  },

  updateProject: async (data: UpdateProjectInput): Promise<Project> => {
    const client = await createApiClient();
    const response = await client.put(API_ENDPOINTS.PROJECT.UPDATE, data);
    return response.data;
  },

  patchProject: async (data: Partial<UpdateProjectInput>): Promise<Project> => {
    const client = await createApiClient();
    const response = await client.patch(API_ENDPOINTS.PROJECT.PATCH, data);
    return response.data;
  },
};
