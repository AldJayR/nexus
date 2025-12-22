/**
 * Authentication Error Handling Utility
 * Maps error codes to user-friendly messages
 * Following security best practices to not expose system internals
 */

export const AuthErrorCode = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_INACTIVE: "ACCOUNT_INACTIVE",
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  TIMEOUT: "TIMEOUT",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

export type AuthError = {
  code: AuthErrorCode;
  message: string;
};

/**
 * Maps error codes to user-friendly messages
 * Note: For security, we use generic messages for authentication failures
 * to avoid revealing whether an email exists in the system
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]:
    "Invalid email or password. Please check your credentials and try again.",
  [AuthErrorCode.ACCOUNT_INACTIVE]:
    "Your account has been deactivated. Please contact your team lead for assistance.",
  [AuthErrorCode.NETWORK_ERROR]:
    "Unable to connect to the server. Please check your internet connection and try again.",
  [AuthErrorCode.SERVER_ERROR]:
    "Something went wrong on our end. Please try again in a few moments.",
  [AuthErrorCode.TIMEOUT]:
    "The request took too long to complete. Please try again.",
  [AuthErrorCode.UNKNOWN_ERROR]:
    "An unexpected error occurred. Please try again.",
};

/**
 * Determines the error code from an error object
 * Analyzes HTTP status codes, error messages, and error types
 */
export function getAuthErrorCode(error: unknown): AuthErrorCode {
  // Network or timeout errors
  if (error && typeof error === "object") {
    const err = error as {
      code?: string;
      message?: string;
      response?: { status?: number; data?: { message?: string } };
    };

    // Check for network errors
    if (err.code === "ECONNABORTED" || err.code === "ENOTFOUND") {
      return AuthErrorCode.NETWORK_ERROR;
    }

    // Check for timeout
    if (err.code === "ETIMEDOUT" || err.message?.includes("timeout")) {
      return AuthErrorCode.TIMEOUT;
    }

    // Check HTTP status codes
    if (err.response?.status) {
      const status = err.response.status;
      const serverMessage = err.response.data?.message?.toLowerCase() || "";

      switch (status) {
        case 401:
          // Check if account is inactive based on server message
          if (
            serverMessage.includes("inactive") ||
            serverMessage.includes("deactivated")
          ) {
            return AuthErrorCode.ACCOUNT_INACTIVE;
          }
          return AuthErrorCode.INVALID_CREDENTIALS;
        case 403:
          return AuthErrorCode.ACCOUNT_INACTIVE;
        case 500:
        case 502:
        case 503:
        case 504:
          return AuthErrorCode.SERVER_ERROR;
        default:
          return AuthErrorCode.UNKNOWN_ERROR;
      }
    }

    // Check for network error indicators
    if (
      err.message?.includes("network") ||
      err.message?.includes("ERR_NETWORK") ||
      err.message?.includes("Failed to fetch")
    ) {
      return AuthErrorCode.NETWORK_ERROR;
    }
  }

  return AuthErrorCode.UNKNOWN_ERROR;
}

/**
 * Creates a user-friendly error message from an error object
 */
export function getAuthErrorMessage(error: unknown): string {
  const errorCode = getAuthErrorCode(error);
  return AUTH_ERROR_MESSAGES[errorCode];
}

/**
 * Creates a structured auth error object
 */
export function createAuthError(error: unknown): AuthError {
  const code = getAuthErrorCode(error);
  const message = AUTH_ERROR_MESSAGES[code];
  return { code, message };
}
