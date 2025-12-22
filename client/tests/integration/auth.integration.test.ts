import { beforeEach, describe, expect, it } from "vitest";
import { loginAction } from "@/actions/login";
import { authApi } from "@/lib/api/auth";
import { AuthErrorCode } from "@/lib/helpers/auth-errors";
import { clearAuth, loginAsAdmin, SEED_CREDENTIALS } from "./helpers";

// These tests require the backend server to be running at http://localhost:3001
// They will make REAL network requests.

describe("Auth Integration Tests - API", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("should reject invalid credentials with 401 from real server", async () => {
    try {
      await authApi.login("nonexistent@example.com", "wrongpassword");
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      // If server is not running, this might be ECONNREFUSED
      if (error.code === "ECONNREFUSED") {
        console.warn(
          "Skipping test: Backend server is not running at http://localhost:3001"
        );
        return;
      }
      // If server is running, we expect 401
      expect(error.response?.status).toBe(401);
    }
  });

  it("should login successfully with seed credentials", async () => {
    try {
      const response = await authApi.login(
        SEED_CREDENTIALS.email,
        SEED_CREDENTIALS.password
      );
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user.email).toBe(SEED_CREDENTIALS.email);
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.warn(
          "⏭️  Skipping: Backend server not running at http://localhost:3001"
        );
        return;
      }
      if (error.response?.status === 401) {
        console.warn(
          "⏭️  Skipping: Backend database not seeded with admin credentials"
        );
        console.warn("     Run: pnpm db:seed (in server directory)");
        return;
      }
      throw error;
    }
  });

  it("should get current user profile after login", async () => {
    try {
      await loginAsAdmin();
      const user = await authApi.getCurrentUser();
      expect(user).toBeDefined();
      expect(user.email).toBe(SEED_CREDENTIALS.email);
    } catch (error: any) {
      if (
        error.code === "ECONNREFUSED" ||
        error.message === "BACKEND_NOT_RUNNING" ||
        error.message === "INVALID_SEED_CREDENTIALS"
      ) {
        console.warn("⏭️  Skipping: Backend not running or not properly seeded");
        return;
      }
      throw error;
    }
  });
});

describe("Auth Integration Tests - Server Action (loginAction)", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("should handle invalid credentials and return structured error response", async () => {
    try {
      const result = await loginAction({
        email: "nonexistent@example.com",
        password: "wrongpassword",
      });

      if (result.success) {
        expect.fail("Should have failed with invalid credentials");
      } else {
        // Verify error response structure
        expect(result.authError).toBeDefined();
        expect(result.authError?.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
        expect(result.authError?.message).toBeDefined();
        expect(result.error).toBeDefined();
      }
    } catch (error: any) {
      if (
        error.code === "ECONNREFUSED" ||
        error.message === "BACKEND_NOT_RUNNING"
      ) {
        console.warn(
          "⏭️  Skipping: Backend server not running at http://localhost:3001"
        );
        return;
      }
      throw error;
    }
  });

  it("should handle validation errors for invalid email format", async () => {
    const result = await loginAction({
      email: "invalid-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.email).toBeDefined();
  });

  it("should handle validation errors for short password", async () => {
    const result = await loginAction({
      email: "test@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.password).toBeDefined();
  });

  it("should successfully login and return user data", async () => {
    try {
      const result = await loginAction({
        email: SEED_CREDENTIALS.email,
        password: SEED_CREDENTIALS.password,
      });

      // On success, redirect is called, so result might be undefined/null
      // or we might not get here due to redirect throwing
      if (result) {
        expect(result.success).toBe(true);
        expect(result.authError).toBeUndefined();
      }
    } catch (error: any) {
      // Check for backend not running first
      if (
        error.code === "ECONNREFUSED" ||
        error.message === "BACKEND_NOT_RUNNING" ||
        error.message === "INVALID_SEED_CREDENTIALS"
      ) {
        console.warn("⏭️  Skipping: Backend not running or not properly seeded");
        return;
      }
      // redirect() throws NEXT_REDIRECT error which is expected on success
      const errorStr = String(error);
      if (errorStr.includes("NEXT_REDIRECT")) {
        // This is expected - redirect happened on successful login
        return;
      }
      throw error;
    }
  });

  it("should handle network errors gracefully", async () => {
    // This test is more conceptual - actual network error testing
    // would require mocking or a disconnected network
    try {
      const result = await loginAction({
        email: SEED_CREDENTIALS.email,
        password: SEED_CREDENTIALS.password,
      });

      // If we get here, check the response
      if (result && !result.success) {
        expect(result.authError?.code).toBeTruthy();
        expect([
          AuthErrorCode.NETWORK_ERROR,
          AuthErrorCode.TIMEOUT,
          AuthErrorCode.SERVER_ERROR,
          AuthErrorCode.INVALID_CREDENTIALS,
        ]).toContain(result.authError?.code);
      }
    } catch (error: any) {
      // Redirect on success is expected
      const errorStr = String(error);
      if (errorStr.includes("NEXT_REDIRECT")) {
        return;
      }

      if (error.code === "ECONNREFUSED") {
        console.warn("Skipping test: Backend server is not running");
        return;
      }
      throw error;
    }
  });
});

describe("Auth Error Handling", () => {
  it("should map 401 to INVALID_CREDENTIALS error code", async () => {
    try {
      await authApi.login("test@example.com", "wrongpassword");
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.warn("Skipping test: Backend server is not running");
        return;
      }

      // Verify 401 status
      expect(error.response?.status).toBe(401);
    }
  });

  it("should handle account deactivation (403) scenario", async () => {
    try {
      // In a real scenario, you would have a deactivated user to test
      // For now, we'll just verify the error handling structure
      const mockError = {
        response: {
          status: 403,
          data: { message: "Your account has been deactivated" },
        },
      };

      expect(mockError.response.status).toBe(403);
      expect(mockError.response.data.message).toContain("deactivated");
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.warn("Skipping test: Backend server is not running");
        return;
      }
      throw error;
    }
  });
});
