import { authApi } from "@/lib/api/auth";
import { resetMockCookies, setMockCookie } from "./mock-store";

export const SEED_CREDENTIALS = {
  email: process.env.SEED_EMAIL || "alice.johnson@nexus.local",
  password: process.env.SEED_PASSWORD || "password123",
};

export const loginAsAdmin = async () => {
  try {
    const response = await authApi.login(
      SEED_CREDENTIALS.email,
      SEED_CREDENTIALS.password
    );
    if (response.token) {
      setMockCookie("auth_token", response.token);
    }
    return response;
  } catch (error: any) {
    // Check if it's a connection error (server not running)
    if (error.code === "ECONNREFUSED" || error.message?.includes("ECONNREFUSED")) {
      console.warn("⚠️ Backend server is not running at http://localhost:3001");
      console.warn("Integration tests require the backend to be running");
      throw new Error("BACKEND_NOT_RUNNING");
    }

    // Check if it's a 401 (auth failed)
    if (error.response?.status === 401) {
      console.error(
        `❌ Login failed with 401. Check seed credentials: ${SEED_CREDENTIALS.email}`
      );
      console.error(
        "Make sure backend database is seeded with: SEED_EMAIL and SEED_PASSWORD env vars"
      );
      throw new Error("INVALID_SEED_CREDENTIALS");
    }

    console.error("Failed to login as admin:", error);
    throw error;
  }
};

export const clearAuth = () => {
  resetMockCookies();
};
