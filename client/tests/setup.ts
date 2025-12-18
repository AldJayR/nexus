import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { handlers } from "../__mocks__/handlers";

// Mock Next.js headers
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      if (name === "auth_token") {
        return { value: "mock-jwt-token" };
      }
      return;
    },
    getAll: () => [],
    has: () => false,
    set: () => {},
    delete: () => {},
  }),
}));

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
