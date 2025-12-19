import { vi } from 'vitest'

// Ensure we are not using MSW
// We might want to load .env.test here if needed
// For now, we assume the environment is set up correctly or defaults are used.

// Mock Next.js headers just in case code uses it, but we want real network requests
vi.mock('next/headers', async () => {
  // Dynamic import to avoid hoisting issues
  // We need to use a relative path that works from where this file is located
  // This file is in client/tests/integration-setup.ts
  // mock-store is in client/tests/integration/mock-store.ts
  const { mockCookieStore } = await import('./integration/mock-store')
  
  return {
    cookies: () => ({
      get: (key: string) => {
        const value = mockCookieStore.get(key)
        return value ? { value } : undefined
      },
      getAll: () => Array.from(mockCookieStore.entries()).map(([name, value]) => ({ name, value })),
      set: (key: string, value: string) => mockCookieStore.set(key, value),
      delete: (key: string) => mockCookieStore.delete(key),
    }),
  }
})
