"use server";

import axios, { type AxiosError, type AxiosInstance } from "axios";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_BASE_URL = `${API_URL}/api/v1`;

export const createApiClient = async (): Promise<AxiosInstance> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor: Add auth token if available
  client.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle common errors
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid - will be handled in middleware
        // Client-side logout can be triggered via server action
      }

      return Promise.reject(error);
    }
  );

  return client;
};
