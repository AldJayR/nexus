# 4. Data Fetching Patterns

Recommended patterns for fetching data using Axios in Server and Client Components, following proper API call sequencing.

## Axios Configuration

Create a configured Axios instance with interceptors for consistent error handling and request/response processing.

```typescript
// src/lib/api/client.ts
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Add auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add headers, auth tokens, etc.
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: Handle errors consistently
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      // Example: redirect('/login')
    }
    return Promise.reject(error)
  }
)
```

## Server-Side Data Fetching

Fetch data directly in Server Components using Axios for better performance and security.

```typescript
// src/lib/api/sprints.ts
import { apiClient } from './client'

export async function fetchSprints() {
  try {
    const response = await apiClient.get('/sprints')
    return response.data
  } catch (error) {
    console.error('Failed to fetch sprints:', error)
    throw new Error('Failed to fetch sprints')
  }
}

export async function fetchSprint(id: string) {
  try {
    const response = await apiClient.get(`/sprints/${id}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch sprint ${id}:`, error)
    throw new Error(`Failed to fetch sprint ${id}`)
  }
}
```

### Using in Server Components

```tsx
// src/app/sprints/page.tsx
import { fetchSprints } from '@/lib/api/sprints'

export default async function SprintsPage() {
  const sprints = await fetchSprints()

  return (
    <ul>
      {sprints.map((sprint) => (
        <li key={sprint.id}>{sprint.name}</li>
      ))}
    </ul>
  )
}
```

---

## Server Actions with Axios (Data Mutations)

Server Actions handle data mutations using a consistent sequencing pattern: schema validation → authorization → API call → revalidation → error handling.

```typescript
// src/app/actions/sprints.ts
'use server'

import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 1. Define schema outside the action for reuse
const CreateSprintSchema = z.object({
  name: z.string().min(1, 'Sprint name required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
})

export async function createSprint(prevState: any, formData: FormData) {
  // 2. Input Validation
  const validatedFields = CreateSprintSchema.safeParse({
    name: formData.get('name'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to create sprint.',
    }
  }

  // 3. Auth Check (if needed)
  // const session = await auth()
  // if (!session) return { message: 'Unauthorized' }

  try {
    // 4. API Operation
    await apiClient.post('/sprints', validatedFields.data)

    // 5. Revalidation (Update Cache)
    revalidatePath('/dashboard/sprints')
  } catch (error) {
    // 6. Error Handling
    console.error('Failed to create sprint:', error)
    return { message: 'Database error: Failed to create sprint.' }
  }

  // 7. Redirect (OUTSIDE try/catch - redirect throws special error)
  redirect('/dashboard/sprints')
}

export async function deleteSprint(prevState: any, formData: FormData) {
  const sprintId = formData.get('id') as string

  if (!sprintId) {
    return { message: 'Sprint ID is required' }
  }

  try {
    await apiClient.delete(`/sprints/${sprintId}`)
    revalidatePath('/dashboard/sprints')
  } catch (error) {
    console.error('Failed to delete sprint:', error)
    return { message: 'Failed to delete sprint' }
  }

  redirect('/dashboard/sprints')
}
```

### Using Server Actions in Forms

```typescript
// src/components/sprint-form.tsx
'use client'

import { useActionState } from 'react'
import { createSprint } from '@/app/actions/sprints'

const initialState = {
  message: '',
  errors: {},
}

export function SprintForm() {
  const [state, formAction, pending] = useActionState(createSprint, initialState)

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">Sprint Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          aria-describedby="name-error"
        />
        {state.errors?.name && (
          <p id="name-error" className="text-red-500">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      {state.message && (
        <p className="text-red-500" aria-live="polite">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create Sprint'}
      </button>
    </form>
  )
}
```

---

## Suspense with Server Components

Use Suspense for better UX when fetching data in Server Components:

```tsx
// src/app/sprints/page.tsx
import { Suspense } from 'react'
import { fetchSprints } from '@/lib/api/sprints'
import { Skeleton } from '@/components/ui/skeleton'

async function SprintsList() {
  const sprints = await fetchSprints()

  return (
    <ul>
      {sprints.map((sprint) => (
        <li key={sprint.id}>{sprint.name}</li>
      ))}
    </ul>
  )
}

export default function SprintsPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <SprintsList />
    </Suspense>
  )
}
```

---

## API Call Sequencing (Server Actions)

Proper sequencing ensures reliability, security, and correct state management:

1. **Schema Definition**: Define validation schema outside action (reusable)
2. **Input Validation**: Use `safeParse` and return errors early
3. **Authorization**: Check user permissions if needed
4. **API Operation**: Execute API call in try/catch block
5. **Revalidation**: Call `revalidatePath` inside try (succeeds only on operation success)
6. **Error Handling**: Catch errors and return error objects (don't throw)
7. **Redirect**: Call `redirect()` outside try/catch (throws special error)

**Important**: `redirect()` throws an error internally. If placed inside try/catch, the catch block will intercept it. Always place redirects after the try/catch block.

---

## Best Practices

- **Server-side**: Use Axios in Server Components and Server Actions for security
- **Client-side**: Use Axios with SWR for caching and revalidation
- **Validation**: Define Zod schemas separately and reuse in Server Actions
- **Errors**: Return error objects from Server Actions to useActionState
- **Revalidation**: Use `revalidatePath` for page revalidation after mutations
- **Redirection**: Place `redirect()` outside try/catch blocks
- **TypeScript**: Always type API responses and form data

---

## Data Fetching Architecture

```
┌─ Server Components
│  ├─ Direct Axios calls
│  ├─ Suspense boundaries
│  └─ Pass data as props to Client Components
│
├─ Server Actions (Mutations)
│  ├─ Schema validation (Zod)
│  ├─ Authorization check
│  ├─ Axios API call
│  ├─ Revalidation (revalidatePath)
│  └─ Redirect (outside try/catch)
│
└─ Client Components
   ├─ useActionState for form submissions
   ├─ useSWR with Axios for data fetching
   └─ useActionState for loading/error states
```
