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
- **Client-side**: Use React's `use` hook or SWR/React Query (AVOID useEffect)
- **Validation**: Define Zod schemas separately and reuse in Server Actions
- **Errors**: Return error objects from Server Actions to useActionState
- **Revalidation**: Use `revalidatePath` for page revalidation after mutations
- **Redirection**: Place `redirect()` outside try/catch blocks
- **TypeScript**: Always type API responses and form data
- **Avoid useEffect**: Next.js docs explicitly discourage useEffect for data fetching due to waterfalls and poor performance

---

## Client Component Data Fetching (When Necessary)

**❌ ANTI-PATTERN: useEffect for Data Fetching**
```tsx
// DON'T DO THIS - Creates client-server waterfalls
"use client";
const [data, setData] = useState();
useEffect(() => {
  async function fetchData() {
    const result = await getServerAction();
    setData(result);
  }
  fetchData();
}, []);
```

**✅ RECOMMENDED: Server Component → Client Component Props Pattern**
```tsx
// app/settings/project-config/page.tsx (Server Component)
import { getProject } from '@/lib/data/project'
import GeneralSettingsForm from '@/components/team-lead/settings/project-config/general-settings-form'

export default async function ProjectConfigPage() {
  const project = await getProject() // Fetch on server
  return <GeneralSettingsForm project={project} /> // Pass as props
}

// components/team-lead/settings/project-config/general-settings-form.tsx (Client Component)
"use client";
interface Props {
  project: Project;
}

export default function GeneralSettingsForm({ project }: Props) {
  // Initialize form with server-fetched data
  const form = useForm({
    defaultValues: {
      name: project.name,
      description: project.description,
    }
  });
  // Handle form submission...
}
```

**✅ ALTERNATIVE: React's `use` Hook (Streaming)**
```tsx
// app/settings/page.tsx (Server Component)
import { Suspense } from 'react'
import { getProject } from '@/lib/data/project'
import SettingsForm from './settings-form'

export default function SettingsPage() {
  const projectPromise = getProject() // Don't await
  return (
    <Suspense fallback={<Skeleton />}>
      <SettingsForm projectPromise={projectPromise} />
    </Suspense>
  )
}

// settings-form.tsx (Client Component)
"use client";
import { use } from 'react'

export default function SettingsForm({ projectPromise }: { projectPromise: Promise<Project> }) {
  const project = use(projectPromise) // Unwrap promise
  // Use project data...
}
```

**✅ LAST RESORT: SWR or React Query (Complex Client-Side Needs)**
```tsx
// Only use when you need polling, revalidation, caching, etc.
"use client";
import useSWR from 'swr'

export default function DynamicSettings() {
  const { data, error, isLoading } = useSWR('/api/project', fetcher, {
    refreshInterval: 5000, // Poll every 5s
    revalidateOnFocus: true,
  })
  
  if (isLoading) return <Skeleton />
  if (error) return <div>Error loading</div>
  return <Form data={data} />
}
```

---

## File Structure for Data Fetching

Separate data fetching logic from components using a `lib/data` directory:

```
lib/
  data/
    project.ts        # Data fetching functions
    phases.ts         # Phase-related data fetching
    team.ts           # Team-related data fetching
  api/
    client.ts         # Axios instance
    projectApi.ts     # API endpoints
    phaseApi.ts       # API endpoints
```

**Example Data Fetching File:**
```typescript
// lib/data/project.ts
import { projectApi } from '@/lib/api'
import type { Project } from '@/lib/types'

export async function getProject(): Promise<Project | null> {
  try {
    const response = await projectApi.get();
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
}

export async function getProjectWithPhases() {
  try {
    const [project, phases] = await Promise.all([
      projectApi.get(),
      phaseApi.getAll(),
    ]);
    return { project: project.data, phases: phases.data };
  } catch (error) {
    console.error('Failed to fetch project with phases:', error);
    throw error;
  }
}
```

---

## Data Fetching Architecture

```
┌─ Server Components (Pages)
│  ├─ Fetch data with async/await
│  ├─ Use Suspense boundaries for streaming
│  ├─ Pass data as props to Client Components
│  └─ No loading states needed (handled by Suspense)
│
├─ Data Layer (lib/data)
│  ├─ Reusable fetch functions
│  ├─ Error handling
│  └─ Type definitions
│
├─ Server Actions (Mutations)
│  ├─ Schema validation (Zod)
│  ├─ Authorization check
│  ├─ API call (via lib/api)
│  ├─ Revalidation (revalidatePath)
│  └─ Redirect (outside try/catch)
│
└─ Client Components (Interactivity)
   ├─ Receive data via props (preferred)
   ├─ Use React's `use` hook for promises (streaming)
   ├─ useActionState for form submissions
   ├─ SWR/React Query (only when needed)
   └─ AVOID useEffect for data fetching
```

---

## When to Use Each Pattern

| Pattern                      | Use Case                               | Example                               |
| ---------------------------- | -------------------------------------- | ------------------------------------- |
| **Server Component**         | Static or per-request data             | Settings pages, profile pages         |
| **Server Component + Props** | Interactive forms with initial data    | Edit forms, configuration pages       |
| **use Hook + Promise**       | Streaming data to client               | Large datasets, progressive rendering |
| **SWR/React Query**          | Polling, revalidation, complex caching | Live dashboards, real-time data       |
| **useEffect**                | ❌ AVOID for data fetching              | Use only for side effects, not data   |

---

## TanStack Table Best Practices

TanStack Table (React Table) is a headless table library that works with both client-side and server-side data fetching patterns.

### Client-Side Pattern (Small Datasets)

Use client-side row models when the dataset is small enough to fit in memory (typically < 1000 rows).

**Best for:** Team members, settings tables, paginated lists where pagination is local.

```tsx
// app/team/page.tsx (Server Component)
import { getTeamUsers } from '@/lib/data/team'
import TeamMembersTable from '@/components/team-members/table'

export default async function TeamPage() {
  const users = await getTeamUsers() // Fetch all data
  return <TeamMembersTable data={users} />
}

// components/team-members/table.tsx (Client Component)
"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table"
import { useState } from "react"

interface TeamMembersTableProps {
  data: User[]
}

export default function TeamMembersTable({ data }: TeamMembersTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Client-side models handle filtering, sorting, pagination locally
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Enable pagination
    getSortedRowModel: getSortedRowModel(), // Enable sorting
    getFilteredRowModel: getFilteredRowModel(), // Enable filtering
    state: {
      columnFilters,
      sorting,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  return (
    // Render table...
  )
}
```

**Pros:**
- Simple implementation
- No server calls for pagination/sorting/filtering
- Works offline

**Cons:**
- Loads all data at once
- Poor UX with large datasets
- Higher initial load time

### Server-Side Pattern (Large Datasets)

Use server-side models when working with large datasets or needing real-time data filtering.

**Best for:** User directories with thousands of entries, live-updating dashboards.

```tsx
// app/users/page.tsx (Server Component)
import { getUsers } from '@/lib/data/users'
import UsersTable from '@/components/users/table'

export default async function UsersPage() {
  // For server-side, fetch initial data
  const { users, totalCount } = await getUsers({
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'name',
  })
  
  return <UsersTable initialData={users} totalCount={totalCount} />
}

// components/users/table.tsx (Client Component)
"use client";

import {
  useReactTable,
  getCoreRowModel,
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

interface UsersTableProps {
  initialData: User[]
  totalCount: number
}

export default function UsersTable({ initialData, totalCount }: UsersTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Fetch data when table state changes
  const { data } = useQuery({
    queryKey: ['users', columnFilters, sorting, pagination],
    queryFn: () =>
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          filters: columnFilters,
          sorting,
          pagination,
        }),
      }).then(r => r.json()),
    initialData,
  })

  const table = useReactTable({
    data: data?.users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    // No pagination/sorting/filtering models - server handles these
    manualPagination: true, // Server handles pagination
    manualSorting: true, // Server handles sorting
    manualFiltering: true, // Server handles filtering
    rowCount: data?.totalCount, // Total rows on server
    state: {
      columnFilters,
      sorting,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  return (
    // Render table...
  )
}
```

**API Endpoint Example:**
```typescript
// app/api/users/route.ts
import { getUsers } from '@/lib/data/users'

export async function POST(req: Request) {
  const { filters, sorting, pagination } = await req.json()

  const result = await getUsers({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id || 'name',
    sortDesc: sorting[0]?.desc,
    filters,
  })

  return Response.json(result)
}
```

**Pros:**
- Scales to millions of rows
- Fast initial load
- Real-time filtering/sorting
- Bandwidth efficient

**Cons:**
- Requires backend API
- More complex implementation
- Network latency for state changes

### Comparison

| Feature          | Client-Side          | Server-Side                 |
| ---------------- | -------------------- | --------------------------- |
| **Data Size**    | < 1000 rows          | > 1000 rows                 |
| **Initial Load** | Slower (all data)    | Faster (paginated)          |
| **Filtering**    | Instant              | Network latency             |
| **Sorting**      | Instant              | Network latency             |
| **Pagination**   | Instant              | Network latency             |
| **Complexity**   | Simple               | Complex                     |
| **Best For**     | Team lists, settings | User directories, analytics |

---


