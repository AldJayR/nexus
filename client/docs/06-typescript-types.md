# 6. TypeScript & Types

Best practices for TypeScript types and validation schemas.

## Type Organization

Keep types organized in dedicated files:

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
  CANCELLED = 'CANCELLED',
}

export type CreateSprintInput = Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateSprintInput = Partial<CreateSprintInput>
```

---

## Validation Schemas

Define Zod schemas in separate files for reusability:

### Basic Schema

```typescript
// src/lib/validation/sprint.ts
import { z } from 'zod'

export const createSprintSchema = z.object({
  name: z
    .string()
    .min(1, 'Sprint name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  startDate: z.string().datetime('Invalid date format'),
  endDate: z.string().datetime('Invalid date format'),
})

export const updateSprintSchema = createSprintSchema.partial()

export type CreateSprintInput = z.infer<typeof createSprintSchema>
export type UpdateSprintInput = z.infer<typeof updateSprintSchema>
```

### Advanced Schema with Validation

```typescript
// src/lib/validation/sprint.ts
export const createSprintSchema = z.object({
  name: z
    .string()
    .min(1, 'Sprint name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  startDate: z.string().datetime('Invalid date format'),
  endDate: z.string().datetime('Invalid date format'),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)
```

---

## Component Props

Always type component props with interfaces:

```typescript
// Good: Detailed prop interface
interface SprintCardProps {
  sprint: Sprint
  onEdit?: (sprint: Sprint) => void
  onDelete?: (sprintId: string) => Promise<void>
  isLoading?: boolean
}

export default function SprintCard({
  sprint,
  onEdit,
  onDelete,
  isLoading = false,
}: SprintCardProps) {
  // Component code
}
```

---

## Utility Types

Use TypeScript utility types to reduce duplication:

```typescript
// src/types/sprint.ts

// Omit - Remove fields
export type SprintWithoutTimestamps = Omit<
  Sprint,
  'createdAt' | 'updatedAt'
>

// Partial - Make all fields optional
export type PartialSprint = Partial<Sprint>

// Pick - Select specific fields
export type SprintSummary = Pick<Sprint, 'id' | 'name' | 'status'>

// Record - Create object with specific keys
export type SprintStatusCount = Record<SprintStatus, number>

// Readonly - Make properties immutable
export type ReadonlySprint = Readonly<Sprint>

// Extract - Extract types from union
export type ActiveStatus = Extract<SprintStatus, 'ACTIVE'>
```

---

## Generic Types

Use generics for reusable patterns:

```typescript
// src/types/api.ts

// Generic response wrapper
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

// Generic list response
export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// Generic pagination params
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Usage
export async function fetchSprints(
  params: PaginationParams,
): Promise<ListResponse<Sprint>> {
  // Implementation
}
```

---

## Enum vs Union Types

Choose the right approach:

### Use Enums for Fixed Values

```typescript
// Good: Enumeration
enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

// Usage
const status: TaskStatus = TaskStatus.TODO
```

### Use Union Types for Type Safety

```typescript
// Also good: Union type
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

// Or even better with Zod
export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE'])
export type TaskStatus = z.infer<typeof taskStatusSchema>
```

---

## Type Guards

Create type guards for runtime checking:

```typescript
// src/lib/type-guards.ts
import type { Sprint } from '@/types/sprint'

export function isSprint(value: unknown): value is Sprint {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'status' in value
  )
}

// Usage
if (isSprint(data)) {
  console.log(data.name) // TypeScript knows it's a Sprint
}
```

---

## Strict Mode

Enable strict TypeScript checking in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## Best Practices

1. **Always Type Props**: Component props must have type interfaces
2. **Use `type` vs `interface`**: Use `type` for unions, `interface` for objects
3. **Export Types**: Make types available for reuse
4. **Avoid `any`**: Use `unknown` if needed and narrow it down
5. **Validation Schemas**: Keep Zod schemas in separate files
6. **Generics**: Use for reusable patterns
7. **Type Guards**: Check types at runtime when necessary
