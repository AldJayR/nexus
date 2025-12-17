# 9. Error Handling

Strategies for handling and displaying errors gracefully.

## Error Boundaries

Use Error Boundaries to catch component errors:

```typescript
// src/app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking service
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}
```

### Specific Route Error Boundary

```typescript
// src/app/(auth)/dashboard/error.tsx
'use client'

import { useRouter } from 'next/navigation'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
      <p>{error.message}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={reset}>Try again</button>
        <button onClick={() => router.push('/')}>Go home</button>
      </div>
    </div>
  )
}
```

---

## 404 Not Found

```typescript
// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600">Page not found</p>
      <Link href="/">Go back home</Link>
    </div>
  )
}
```

### Route-Specific Not Found

```typescript
// src/app/sprints/[id]/not-found.tsx
import Link from 'next/link'

export default function SprintNotFound() {
  return (
    <div className="text-center">
      <h2>Sprint not found</h2>
      <p>The sprint you're looking for doesn't exist.</p>
      <Link href="/sprints">Back to sprints</Link>
    </div>
  )
}
```

---

## API Error Handling with Axios

Axios errors are handled consistently through request/response interceptors in the client configuration.

```typescript
// src/lib/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
})

// Response interceptor handles errors consistently
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle auth error (redirect to login, etc.)
      console.error('Unauthorized:', error.response.data)
    } else if (error.response?.status === 404) {
      console.error('Not found:', error.response.data)
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data)
    }
    return Promise.reject(error)
  }
)
```

### Use in API Functions

```typescript
// src/lib/api/sprints.ts
export async function fetchSprint(id: string) {
  try {
    const response = await apiClient.get(`/sprints/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching sprint:', error)
    throw error // Re-throw for Server Components
  }
}
```

---

## Server Action Error Handling

Server Actions should follow the 7-step sequencing pattern. See [04 - Data Fetching](04-data-fetching.md) for details. Key principles:

1. Return error objects instead of throwing
2. Place `redirect()` outside try/catch
3. Call `revalidatePath()` inside try block only

```typescript
// src/app/actions/sprints.ts
'use server'

import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const sprintSchema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().optional(),
})

export async function createSprintAction(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string }> {
  // Validate input
  const data = Object.fromEntries(formData)
  const parsed = sprintSchema.safeParse(data)

  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || 'Invalid input',
    }
  }

  try {
    // Make API call
    await apiClient.post('/sprints', parsed.data)

    // Revalidate on success
    revalidatePath('/sprints')
  } catch (error) {
    // Return error object (don't throw)
    console.error('Create sprint error:', error)
    return {
      error: 'Failed to create sprint. Please try again.',
    }
  }

  // Redirect outside try/catch
  redirect('/sprints')
}
```

### Using with Forms

```tsx
'use client'

import { useActionState } from 'react'
import { createSprintAction } from '@/app/actions/sprints'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState = {
  error: undefined,
}

export function CreateSprintForm() {
  const [state, formAction, isPending] = useActionState(
    createSprintAction,
    initialState,
  )

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Sprint Name
        </label>
        <Input
          id="name"
          name="name"
          required
          aria-describedby="name-error"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="w-full border rounded p-2"
        />
      </div>

      {state.error && (
        <p
          id="form-error"
          className="text-sm text-red-500"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Sprint'}
      </Button>
    </form>
  )
}
```

---

## Client-Side Error Handling

```tsx
// src/components/sprints/create-sprint-form.tsx
'use client'

import { useActionState } from 'react'
import { createSprintAction } from '@/app/actions/sprints'
import { Button } from '@/components/ui/button'

export function CreateSprintForm() {
  const [state, formAction, isPending] = useActionState(
    createSprintAction,
    { error: undefined, success: false },
  )

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name">Sprint Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
        />
      </div>

      {state.error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="p-3 bg-green-100 text-green-800 rounded">
          Sprint created successfully
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Sprint'}
      </Button>
    </form>
  )
}
```

---

## Global Error Toast

```typescript
// src/components/error-toast.tsx
'use client'

import { useEffect, useState } from 'react'

interface ErrorToastProps {
  error?: string
  onClose: () => void
}

export function ErrorToast({ error, onClose }: ErrorToastProps) {
  const [visible, setVisible] = useState(!!error)

  useEffect(() => {
    if (error) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [error, onClose])

  if (!visible || !error) return null

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded">
      {error}
      <button
        onClick={() => {
          setVisible(false)
          onClose()
        }}
        className="ml-2 font-bold"
      >
        ×
      </button>
    </div>
  )
}
```

---

## Logging Errors

```typescript
// src/lib/error-log.ts
export async function logError(
  error: Error,
  context?: Record<string, unknown>,
) {
  // Send to error tracking service (Sentry, LogRocket, etc.)
  console.error('Logged error:', error, context)

  // In production, send to external service
  if (process.env.NODE_ENV === 'production') {
    await fetch('/api/logs/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
      }),
    }).catch(() => {})
  }
}
```

---

## Best Practices

1. **Catch errors early**: Handle errors at source
2. **User-friendly messages**: Show helpful error messages
3. **Error boundaries**: Wrap routes with error boundaries
4. **Logging**: Log errors for debugging
5. **Graceful degradation**: Show fallbacks for errors
6. **Revalidate on error**: Revalidate cache after fixing
7. **Limit error exposure**: Don't expose technical details to users

---

## Error Handling Hierarchy

```
Global Error Boundary (src/app/error.tsx)
    ↓
Route Error Boundary (src/app/[route]/error.tsx)
    ↓
Component Error Handling
    ↓
Form Validation Errors
    ↓
API Error Handling
    ↓
User Feedback (Toast/Alert)
```
