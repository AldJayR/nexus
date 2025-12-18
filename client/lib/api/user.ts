import type { User, UserContribution } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type UpdateUserInput = {
  name?: string;
  email?: string;
  role?: string;
};

export const userApi = {
  listUsers: async (): Promise<User[]> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.USERS.LIST);
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.USERS.GET(id));
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserInput): Promise<User> => {
    const client = await createApiClient();
    const response = await client.put(API_ENDPOINTS.USERS.UPDATE(id), data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.delete(API_ENDPOINTS.USERS.DELETE(id));
  },

  restoreUser: async (id: string): Promise<User> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.USERS.RESTORE(id));
    return response.data;
  },

  getUserContributions: async (id: string): Promise<UserContribution> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.USERS.CONTRIBUTIONS(id));
    return response.data;
  },
};
