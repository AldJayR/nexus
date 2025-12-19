import { beforeEach, describe, expect, it } from "vitest";
import { userApi } from "@/lib/api/user";
import { clearAuth, loginAsAdmin } from "./helpers";

describe("User Integration Tests", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("should handle getting a non-existent user from real server", async () => {
    try {
      // We need to be logged in to check users usually, but 404 might come before 401 depending on implementation
      // Let's login first to be sure we hit the 404 logic
      await loginAsAdmin();

      await userApi.getUserById("non-existent-id-99999");
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.warn("Skipping test: Backend server is not running");
        return;
      }
      // Expect 404 or 400 depending on ID format validation, or 401 if not auth
      expect([404, 400, 401]).toContain(error.response?.status);
    }
  });

  it("should list users from real server when authenticated", async () => {
    try {
      await loginAsAdmin();
      const users = await userApi.listUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0); // Should at least have the admin user

      // Verify structure of returned user
      const adminUser = users.find((u) => u.email === "admin@nexus.local");
      expect(adminUser).toBeDefined();
      expect(adminUser).toHaveProperty("id");
      expect(adminUser).toHaveProperty("role");
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.warn("Skipping test: Backend server is not running");
        return;
      }
      throw error;
    }
  });
});
