# 5. API Patterns

Organized patterns for managing API calls across your application.

## Directory Structure

```
src/lib/api/
 auth.ts          # Authentication endpoints
 client.ts        # Axios client factory
 endpoints.ts     # Centralized API endpoint constants
 sprint.ts        # Sprint endpoints
 task.ts          # Task endpoints
 project.ts       # Project endpoints
 deliverable.ts   # Deliverable endpoints
 user.ts          # User endpoints
 phase.ts         # Phase endpoints
 evidence.ts      # Evidence endpoints
 comment.ts       # Comment endpoints
 meeting-log.ts   # Meeting Log endpoints
 activity-log.ts  # Activity Log endpoints (New)
 notification.ts  # Notification endpoints (New)
 analytics.ts     # Analytics endpoints (New)
 backup.ts        # Backup endpoints (New)
 index.ts         # Barrel export
```

## Centralized Endpoints

We use a centralized `endpoints.ts` file to manage all API routes. This avoids hardcoding strings in multiple places.

```typescript
// src/lib/api/endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    // ...
  },
  SPRINTS: {
    LIST: "/sprints",
    GET: (id: string) => `/sprints/${id}`,
    // ...
  },
  // ...
} as const;
```

## Barrel Exports

Use barrel exports for clean imports:

```typescript
// src/lib/api/index.ts
export { authApi } from "./auth";
export { sprintApi } from "./sprint";
// ...
```

Usage:

```typescript
import { sprintApi, taskApi } from "@/lib/api";

// Use in server components or hooks
const sprints = await sprintApi.listSprints();
```

---

## Axios Configuration

The API client is configured in `src/lib/api/client.ts`. It exports a `createApiClient` function that handles headers and authentication (cookies).

```typescript
// src/lib/api/client.ts
import axios from "axios";

export const createApiClient = async () => {
  // ... configuration with headers and cookies
};
```

---

## Endpoint-Specific Modules

### Sprint API Example

```typescript
// src/lib/api/sprint.ts
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { Sprint } from "@/lib/types";

export const sprintApi = {
  listSprints: async (): Promise<Sprint[]> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.SPRINTS.LIST);
    return response.data;
  },

  getSprintById: async (id: string): Promise<Sprint> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.SPRINTS.GET(id));
    return response.data;
  },
  
  // ...
};
```

## Error Handling

API errors should be handled in the calling component or hook. The `createApiClient` may have interceptors to handle common errors like 401 Unauthorized.

```typescript
try {
  await sprintApi.createSprint(data);
} catch (error) {
  // Handle error
}
```
