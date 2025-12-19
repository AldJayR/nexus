import { describe, expect, it } from "vitest";
import { authApi } from "../auth";

describe("Auth API", () => {
  it("should login successfully with valid credentials", async () => {
    const response = await authApi.login("test@example.com", "password123");

    expect(response.user.email).toBe("test@example.com");
    expect(response.token).toBeDefined();
  });

  it("should fail with invalid credentials", async () => {
    try {
      await authApi.login("test@example.com", "wrongpassword");
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  it("should handle server errors gracefully", async () => {
    try {
      await authApi.login("server-error@example.com", "password123");
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.response.status).toBe(500);
    }
  });
});
