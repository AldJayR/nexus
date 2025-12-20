import { beforeEach, describe, expect, it } from "vitest";
import { authApi } from "@/lib/api/auth";
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

  it("should soft delete and restore a user", async () => {
    try {
      await loginAsAdmin();

      // 1. Create a temporary user
      const tempEmail = `test-delete-${Date.now()}@nexus.local`;
      const newUser = await authApi.inviteUser(
        tempEmail,
        "Test Delete User",
        "MEMBER"
      );
      expect(newUser).toBeDefined();
      expect(newUser.id).toBeDefined();

      // 2. Verify user is in the list
      let users = await userApi.listUsers();
      expect(users.find((u) => u.id === newUser.id)).toBeDefined();

      // 3. Soft Delete the user
      await userApi.deleteUser(newUser.id);

      // 4. Verify user is NOT in the list (or marked deleted if API returns them)
      // Based on service logic, listUsers filters out deletedAt: null
      users = await userApi.listUsers();
      expect(users.find((u) => u.id === newUser.id)).toBeUndefined();

      // 5. Restore the user
      await userApi.restoreUser(newUser.id);

      // 6. Verify user is back in the list
      users = await userApi.listUsers();
      expect(users.find((u) => u.id === newUser.id)).toBeDefined();
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.warn("Skipping test: Backend server is not running");
        return;
      }
      throw error;
    }
  });
});
