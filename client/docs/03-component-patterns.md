# 3. Component Patterns

Learn the recommended patterns for building components in the Nexus frontend.

## Server Components (Default)

Server Components are the default in Next.js 13+. Use them for data fetching and server-only logic.

```tsx
// src/app/sprints/page.tsx
import { Suspense } from 'react'
import { fetchSprints } from '@/lib/api/sprints'
import SprintList from '@/components/sprints/sprint-list'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Sprints',
  description: 'View and manage project sprints',
}

export default async function SprintsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sprints</h1>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <SprintList />
      </Suspense>
    </div>
  )
}

async function SprintList() {
  const sprints = await fetchSprints()

  return (
    <div className="grid gap-4">
      {sprints.map((sprint) => (
        <div key={sprint.id} className="p-4 border rounded">
          <h2 className="font-semibold">{sprint.name}</h2>
        </div>
      ))}
    </div>
  )
}
```

### Key Points

- Server Components are default (no 'use client' directive needed)
- Fetch data directly using axios from `@/lib/api/client`
- Use Suspense for better loading states
- Pass serializable data as props to Client Components
- Can access databases, APIs, and secrets safely

---

## Client Components

Client Components enable interactivity with browser APIs and React hooks.

```tsx
// src/components/sprints/sprint-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Sprint } from '@/types/sprint'

interface SprintCardProps {
  sprint: Sprint
  onDelete?: (sprintId: string) => void
}

export default function SprintCard({ sprint, onDelete }: SprintCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      if (onDelete) {
        await onDelete(sprint.id)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>{sprint.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{sprint.description}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Key Points

- Use 'use client' only when needed (interactivity, browser APIs)
- Keep Client Components focused and minimal
- Accept data as props from Server Components
- Avoid fetching data in Client Components when possible

---

## When to Use Client Components

Use Client Components when you need:

- **React Hooks** (`useState`, `useEffect`, `useContext`)
- **Browser APIs** (localStorage, geolocation, etc.)
- **Event Listeners** (onClick, onChange, etc.)
- **Context Providers** (ThemeProvider, etc.)

---

## Server Actions (Mutations)

Server Actions handle form submissions and mutations securely on the server.

```typescript
// src/app/actions/sprints.ts
'use server'

import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 1. Schema definition
const createSprintSchema = z.object({
  name: z.string().min(1, 'Sprint name required'),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export async function createSprint(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string }> {
  // 2. Input validation
  const data = Object.fromEntries(formData)
  const parsed = createSprintSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Invalid input' }
  }

  try {
    // 3. API call
    await apiClient.post('/sprints', parsed.data)

    // 4. Revalidation (inside try for success-only)
    revalidatePath('/sprints')
  } catch (error) {
    // 5. Error handling
    console.error('Error creating sprint:', error)
    return { error: 'Failed to create sprint' }
  }

  // 6. Redirect (OUTSIDE try/catch)
  redirect('/sprints')
}
```

### Key Points

- Place in `src/app/actions/`
- Use 'use server' directive
- Follow 7-step sequencing pattern (see [04 - Data Fetching](04-data-fetching.md))
- Use `apiClient` from `@/lib/api/client` for all HTTP calls
- Return error objects, never throw
- Place `redirect()` outside try/catch
- Always `revalidatePath()` on success

---

## Component Composition Pattern

Combine Server and Client Components effectively:

```tsx
// Server Component (page.tsx)
import SprintForm from '@/components/forms/sprint-form'

export default async function SprintsPage() {
  const sprints = await fetchSprints()

  return (
    <div>
      {/* Server-side content */}
      <SprintList sprints={sprints} />
      
      {/* Client-side form */}
      <SprintForm />
    </div>
  )
}
```

```tsx
// Client Component (sprint-form.tsx)
'use client'

import { useForm } from 'react-hook-form'
import { createSprint } from '@/app/actions/sprints'

export default function SprintForm() {
  // Client-side form logic
  return (
    <form action={createSprint}>
      {/* Form fields */}
    </form>
  )
}
```

---

## Passing Server Actions to Client Components

```tsx
// src/app/sprints/page.tsx (Server)
import SprintList from '@/components/sprints/sprint-list'
import { deleteSprint } from '@/app/actions/sprints'
  
export default function SprintsPage() {
  return <SprintList onDelete={deleteSprint} />
}
```

```typescript
// src/components/sprints/sprint-list.tsx (Client)
'use client'

import { deleteSprint } from '@/app/actions/sprints'

interface SprintListProps {
  onDelete: typeof deleteSprint
}

export default function SprintList({ onDelete }: SprintListProps) {
  return (
    // Use onDelete in event handlers
  )
}
```

---

## Props Best Practices

### Always Type Props

```typescript
interface ComponentProps {
  title: string
  count?: number
  isActive: boolean
  onAction: (id: string) => void
}

export default function Component({
  title,
  count = 0,
  isActive,
  onAction,
}: ComponentProps) {
  // Component code
}
```

### Props Naming

- **Data props**: `data`, `items`, `sprint`
- **Callback props**: `onAction`, `onDelete`, `onChange`
- **State props**: `isLoading`, `hasError`, `isOpen`
