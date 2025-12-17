import axios, { type AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Standalone client for use in client components (without token management)
export const createClientSideApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    timeout: 10_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return client;
};
