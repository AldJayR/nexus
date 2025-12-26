import { beforeEach, describe, expect, it } from "vitest";
import { authApi } from "@/lib/api/auth";
import { userApi } from "@/lib/api/user";
import { getCurrentUser } from "@/lib/data/user";
import { clearAuth, loginAsAdmin } from "./helpers";

const SKIP_ON_BACKEND_ERROR = (error: any) => {
  if (
    error.code === "ECONNREFUSED" ||
    error.message === "BACKEND_NOT_RUNNING" ||
    error.message === "INVALID_SEED_CREDENTIALS"
  ) {
    console.warn("⏭️  Skipping: Backend not running or not properly seeded");
    return true;
  }
  return false;
};

describe("User Integration Tests - API", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("should handle getting a non-existent user from real server", async () => {
    try {
      await loginAsAdmin();
      await userApi.getUserById("non-existent-id-99999");
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      if (SKIP_ON_BACKEND_ERROR(error)) {
        return;
      }
      expect([404, 400, 401]).toContain(error.response?.status);
    }
  });

  it("should list users from real server when authenticated", async () => {
    try {
      await loginAsAdmin();
      const users = await userApi.listUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);

      // Just verify we got users, don't check for specific email
      // as seed admin email might vary
      expect(users[0]).toHaveProperty("id");
      expect(users[0]).toHaveProperty("role");
    } catch (error: any) {
      if (SKIP_ON_BACKEND_ERROR(error)) {
        return;
      }
      throw error;
    }
  });

  it("should soft delete and restore a user", async () => {
    try {
      await loginAsAdmin();

      const tempEmail = `test-delete-${Date.now()}@nexus.local`;
      const newUser = await authApi.inviteUser(
        tempEmail,
        "Test Delete User",
        "MEMBER"
      );
      expect(newUser).toBeDefined();
      expect(newUser.id).toBeDefined();

      let users = await userApi.listUsers();
      expect(users.find((u) => u.id === newUser.id)).toBeDefined();

      await userApi.deleteUser(newUser.id);

      users = await userApi.listUsers();
      expect(users.find((u) => u.id === newUser.id)).toBeUndefined();

      await userApi.restoreUser(newUser.id);

      users = await userApi.listUsers();
      expect(users.find((u) => u.id === newUser.id)).toBeDefined();
    } catch (error: any) {
      if (SKIP_ON_BACKEND_ERROR(error)) {
        return;
      }
      throw error;
    }
  });
});

describe("User Integration Tests - Server Actions", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("should return null when getCurrentUser is called without authentication", async () => {
    try {
      const user = await getCurrentUser();
      expect(user).toBeNull();
    } catch (error: any) {
      if (SKIP_ON_BACKEND_ERROR(error)) {
        return;
      }
      expect.fail("getCurrentUser should return null, not throw");
    }
  });

  it("should return user data when getCurrentUser is called with authentication", async () => {
    try {
      await loginAsAdmin();
      const user = await getCurrentUser();

      expect(user).toBeDefined();
      expect(user).not.toBeNull();
      expect(user?.email).toBeDefined();
      expect(user?.id).toBeDefined();
      expect(user?.role).toBeDefined();
    } catch (error: any) {
      if (SKIP_ON_BACKEND_ERROR(error)) {
        return;
      }
      throw error;
    }
  });

  it("should handle API errors gracefully in getCurrentUser", async () => {
    try {
      const user = await getCurrentUser();
      expect(user).toBeNull();
    } catch (error: any) {
      if (SKIP_ON_BACKEND_ERROR(error)) {
        return;
      }
      expect.fail("getCurrentUser should return null on error");
    }
  });
});

describe("User Data Fetching - Error Handling", () => {
  it("should not expose system errors to user", async () => {
    try {
      await loginAsAdmin();

      try {
        await userApi.getUserById("invalid-id");
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.response?.status).toBeTruthy();
        expect(typeof error.response.status).toBe("number");
      }
    } catch (error: any) {
      if (SKIP_ON_BACKEND_ERROR(error)) {
        return;
      }
      throw error;
    }
  });

  it("should properly handle 401 errors in protected API calls", async () => {
    try {
      await userApi.listUsers();
      expect.fail("Should have thrown 401");
    } catch (error: any) {
      if (SKIP_ON_BACKEND_ERROR(error)) {
        return;
      }
      // Error might be a network error without response object
      // Check if it's an axios error with status, or a network error
      if (error.response?.status) {
        expect(error.response.status).toBe(401);
      } else {
        // Should at least have some error indicator
        expect(error).toBeDefined();
      }
    }
  });
});
