# 5. API Patterns

Organized patterns for managing API calls across your application.

## Directory Structure

```
src/lib/api/
├── auth.ts          # Authentication endpoints
├── sprints.ts       # Sprint endpoints
├── tasks.ts         # Task endpoints
├── projects.ts      # Project endpoints
├── deliverables.ts  # Deliverable endpoints
└── index.ts         # Barrel export
```

## Barrel Exports

Use barrel exports for clean imports:

```typescript
// src/lib/api/index.ts
export * from './auth'
export * from './sprints'
export * from './tasks'
export * from './projects'
export * from './deliverables'
```

Usage:

```typescript
// Instead of this
import { fetchSprints } from '@/lib/api/sprints'
import { fetchTasks } from '@/lib/api/tasks'

// Use this
import { fetchSprints, fetchTasks } from '@/lib/api'
```

---

## Axios Configuration

The API client is already configured in [04 - Data Fetching](04-data-fetching.md) with request/response interceptors. Import it in your endpoint modules:

```typescript
// src/lib/api/client.ts (already configured)
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptors for auth, error handling, etc.
```

All endpoint modules import from this client.

---

## Endpoint-Specific Modules

### Sprint API

```typescript
// src/lib/api/sprints.ts
import { apiClient } from './client'
import type { Sprint, CreateSprintInput } from '@/types/sprint'

// GET endpoints
export async function fetchSprints(): Promise<Sprint[]> {
  try {
    const response = await apiClient.get('/sprints')
    return response.data
  } catch (error) {
    console.error('Error fetching sprints:', error)
    throw error
  }
}

export async function fetchSprint(id: string): Promise<Sprint> {
  try {
    const response = await apiClient.get(`/sprints/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching sprint ${id}:`, error)
    throw error
  }
}

// POST/PUT endpoints
export async function createSprint(data: CreateSprintInput): Promise<Sprint> {
  const response = await apiClient.post('/sprints', data)
  return response.data
}

export async function updateSprint(
  id: string,
  data: Partial<CreateSprintInput>,
): Promise<Sprint> {
  const response = await apiClient.put(`/sprints/${id}`, data)
  return response.data
}

// DELETE endpoints
export async function deleteSprint(id: string): Promise<void> {
  await apiClient.delete(`/sprints/${id}`)
}
```

### Task API

```typescript
// src/lib/api/tasks.ts
import { apiClient } from './client'
import type { Task, CreateTaskInput } from '@/types/task'

export async function fetchTasks(sprintId?: string): Promise<Task[]> {
  const params = sprintId ? { sprintId } : {}
  const response = await apiClient.get('/tasks', { params })
  return response.data
}

export async function fetchTask(id: string): Promise<Task> {
  const response = await apiClient.get(`/tasks/${id}`)
  return response.data
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const response = await apiClient.post('/tasks', data)
  return response.data
}

export async function updateTask(
  id: string,
  data: Partial<CreateTaskInput>,
): Promise<Task> {
  const response = await apiClient.put(`/tasks/${id}`, data)
  return response.data
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
}
```

---

## Error Handling

Errors from Axios are caught and logged. For Server Actions, return error objects instead of throwing. See [04 - Data Fetching](04-data-fetching.md) for Server Action error handling patterns.

```typescript
// src/lib/api/sprints.ts
export async function fetchSprints(): Promise<Sprint[]> {
  try {
    const response = await apiClient.get('/sprints')
    return response.data
  } catch (error) {
    console.error('Error fetching sprints:', error)
    throw error // Re-throw for Server Components
  }
}
```

For mutations in Server Actions, return error objects:

```typescript
// src/app/actions/sprints.ts
'use server'

export async function createSprint(prevState: any, formData: FormData) {
  try {
    // Validation...
    // API call...
    revalidatePath('/sprints')
  } catch (error) {
    // Return error object, don't throw
    return { message: 'Failed to create sprint' }
  }
  redirect('/sprints')
}
```

---

## TypeScript Types

Always define and export types:

```typescript
// src/types/sprint.ts
export interface Sprint {
  id: string
  name: string
  description?: string
  status: SprintStatus
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export enum SprintStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export type CreateSprintInput = Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateSprintInput = Partial<CreateSprintInput>
```

---

## Best Practices

1. **Separation**: Keep each endpoint module focused
2. **Reusability**: Use generic helpers to reduce duplication
3. **Type Safety**: Always type request and response data
4. **Error Handling**: Catch and handle errors gracefully
5. **Constants**: Use environment variables for API URL
6. **Naming**: Use verb + noun pattern (fetchSprints, createSprint)
7. **Documentation**: Add JSDoc comments for complex functions

---

## API Call Flow

```
User Interaction
    ↓
Server Action (validates and handles mutations)
    ↓
apiCall() helper (manages HTTP)
    ↓
Response type validation
    ↓
Error handling
    ↓
Cache revalidation
    ↓
UI Update
```
