import type { LoginResponse, User } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    const client = await createApiClient();
    await client.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  getCurrentUser: async (): Promise<User> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    const client = await createApiClient();
    await client.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      oldPassword,
      newPassword,
    });
  },

  inviteUser: async (email: string, role: string): Promise<User> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.AUTH.INVITE, {
      email,
      role,
    });
    return response.data;
  },
};
