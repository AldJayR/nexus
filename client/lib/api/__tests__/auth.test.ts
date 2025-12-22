import { describe, expect, it } from "vitest";
import {
  AuthErrorCode,
  createAuthError,
  getAuthErrorCode,
  getAuthErrorMessage,
} from "@/lib/helpers/auth-errors";
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

describe("Auth Error Mapping", () => {
  describe("getAuthErrorCode", () => {
    it("should map 401 status to INVALID_CREDENTIALS", () => {
      const error = {
        response: { status: 401 },
      };

      const code = getAuthErrorCode(error);
      expect(code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });

    it("should map 403 status to ACCOUNT_INACTIVE", () => {
      const error = {
        response: { status: 403 },
      };

      const code = getAuthErrorCode(error);
      expect(code).toBe(AuthErrorCode.ACCOUNT_INACTIVE);
    });

    it("should map 500 status to SERVER_ERROR", () => {
      const error = {
        response: { status: 500 },
      };

      const code = getAuthErrorCode(error);
      expect(code).toBe(AuthErrorCode.SERVER_ERROR);
    });

    it("should detect network errors from code", () => {
      const error = {
        code: "ECONNREFUSED",
      };

      const code = getAuthErrorCode(error);
      expect(code).toBe(AuthErrorCode.NETWORK_ERROR);
    });

    it("should detect timeout errors", () => {
      const error = {
        code: "ETIMEDOUT",
      };

      const code = getAuthErrorCode(error);
      expect(code).toBe(AuthErrorCode.TIMEOUT);
    });

    it("should detect network error from message", () => {
      const error = {
        message: "Failed to fetch network error",
      };

      const code = getAuthErrorCode(error);
      expect(code).toBe(AuthErrorCode.NETWORK_ERROR);
    });

    it("should return UNKNOWN_ERROR for unmapped errors", () => {
      const error = new Error("Some random error");

      const code = getAuthErrorCode(error);
      expect(code).toBe(AuthErrorCode.UNKNOWN_ERROR);
    });

    it("should detect account deactivation from server message", () => {
      const error = {
        response: {
          status: 401,
          data: { message: "Your account has been deactivated" },
        },
      };

      const code = getAuthErrorCode(error);
      expect(code).toBe(AuthErrorCode.ACCOUNT_INACTIVE);
    });
  });

  describe("getAuthErrorMessage", () => {
    it("should return user-friendly message for INVALID_CREDENTIALS", () => {
      const error = {
        response: { status: 401 },
      };

      const message = getAuthErrorMessage(error);
      expect(message).toContain("Invalid email or password");
    });

    it("should return user-friendly message for NETWORK_ERROR", () => {
      const error = {
        code: "ECONNREFUSED",
      };

      const message = getAuthErrorMessage(error);
      expect(message).toContain("unable to connect");
    });

    it("should return user-friendly message for TIMEOUT", () => {
      const error = {
        code: "ETIMEDOUT",
      };

      const message = getAuthErrorMessage(error);
      expect(message).toContain("took too long");
    });

    it("should return user-friendly message for SERVER_ERROR", () => {
      const error = {
        response: { status: 500 },
      };

      const message = getAuthErrorMessage(error);
      expect(message).toContain("Something went wrong");
    });

    it("should return user-friendly message for ACCOUNT_INACTIVE", () => {
      const error = {
        response: { status: 403 },
      };

      const message = getAuthErrorMessage(error);
      expect(message).toContain("deactivated");
    });
  });

  describe("createAuthError", () => {
    it("should create auth error object with code and message", () => {
      const error = {
        response: { status: 401 },
      };

      const authError = createAuthError(error);

      expect(authError.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
      expect(authError.message).toBeDefined();
      expect(authError.message).toContain("Invalid email or password");
    });

    it("should create auth error for network failures", () => {
      const error = {
        code: "ECONNREFUSED",
      };

      const authError = createAuthError(error);

      expect(authError.code).toBe(AuthErrorCode.NETWORK_ERROR);
      expect(authError.message).toContain("Unable to connect");
    });

    it("should handle unknown errors gracefully", () => {
      const error = new Error("Unknown error");

      const authError = createAuthError(error);

      expect(authError.code).toBe(AuthErrorCode.UNKNOWN_ERROR);
      expect(authError.message).toBeDefined();
    });
  });

  describe("Error Message Security", () => {
    it("should not expose that email exists in system for 401", () => {
      const error = {
        response: { status: 401 },
      };

      const message = getAuthErrorMessage(error);

      // Should use generic message, not specific to email existence
      expect(message).toContain("Invalid email or password");
      expect(message).not.toContain("email not found");
      expect(message).not.toContain("does not exist");
    });

    it("should provide actionable message for deactivated account", () => {
      const error = {
        response: {
          status: 403,
          data: { message: "Account deactivated" },
        },
      };

      const message = getAuthErrorMessage(error);

      // Should guide user to take action
      expect(message).toContain("contact");
      expect(message).toContain("team lead");
    });
  });
});
