# 2. Naming Conventions

Consistent naming conventions make code more predictable and easier to navigate.

## Files & Directories

### Components

- **Format**: kebab-case with `.tsx` extension
- **Examples**: 
  - ✓ `sprint-card.tsx`, `comp-card.tsx`
  - ✗ `SprintCard.tsx`, `TaskBoard.tsx`, `AppHeader.tsx`

### API/Utility Functions

- **Format**: camelCase with `.ts` extension
- **Examples**:
  - ✓ `fetchSprints.ts`, `validateForm.ts`, `calculateTotal.ts`
  - ✗ `FetchSprints.ts`, `fetch-sprints.ts`

### Directories

- **Format**: kebab-case (lowercase with hyphens)
- **Examples**:
  - ✓ `app/sprints`, `components/ui`, `lib/api`
  - ✗ `app/Sprints`, `components/UI`

### Private/Internal Folders

- **Format**: Prefix with underscore
- **Examples**:
  - ✓ `_components/`, `_utils/`, `_helpers/`
- **Purpose**: Hide from routing, organize internal logic

---

## React Components

### Page Components
- Named `page.tsx` (Next.js convention)
- Located in `app/` directory

### Layout Components
- Named `layout.tsx` (Next.js convention)
- Located at route segment level

### Error Boundaries
- Named `error.tsx` (Next.js convention)
- Named `global-error.tsx` for root

### Reusable Components
- Descriptive names ending with component type
- Examples:
  - ✓ `SprintCard`, `TaskForm`, `PhaseList`
  - ✗ `SprintComponent`, `TaskUI`, `Phase`

---

## Functions & Variables

### React Components

- **Format**: PascalCase
- **Examples**:
  - ✓ `function SprintCard() {}`
  - ✓ `export default SprintCard`

### Regular Functions

- **Format**: camelCase
- **Examples**:
  - ✓ `const fetchSprints = async () => {}`
  - ✓ `function validateEmail(email) {}`

### Constants

- **Format**: UPPER_SNAKE_CASE
- **Examples**:
  - ✓ `const MAX_RETRIES = 3`
  - ✓ `const API_TIMEOUT = 5000`
  - ✓ `const DEFAULT_PAGE_SIZE = 10`

### Private Functions

- **Format**: camelCase, prefix with underscore
- **Examples**:
  - ✓ `const _parseResponse = (data) => {}`
  - ✓ `function _formatDate(date) {}`

### Event Handlers

- **Format**: camelCase starting with `handle` or `on`
- **Examples**:
  - ✓ `const handleClick = () => {}`
  - ✓ `const handleSubmit = (data) => {}`
  - ✓ `const onDelete = (id) => {}`

### Boolean Variables

- **Format**: Start with `is`, `has`, `should`, `can`
- **Examples**:
  - ✓ `const isLoading = false`
  - ✓ `const hasPermission = true`
  - ✓ `const shouldRefresh = false`

---

## Files with Specific Purposes

### API Files
```
src/lib/api/
├── sprints.ts          # fetchSprints, fetchSprint, createSprint
├── tasks.ts            # fetchTasks, createTask, updateTask
└── index.ts            # Barrel export
```

### Validation Files
```
src/lib/validation/
├── sprint.ts           # createSprintSchema, updateSprintSchema
├── task.ts             # createTaskSchema, updateTaskSchema
└── index.ts            # Barrel export
```

### Hook Files
```
src/hooks/
├── use-sprints.ts      # useSprints hook
├── use-tasks.ts        # useTasks hook
└── index.ts            # Barrel export
```

### Type Files
```
src/types/
├── sprint.ts           # Sprint, SprintStatus, CreateSprintInput
├── task.ts             # Task, TaskStatus, CreateTaskInput
└── index.ts            # Barrel export
```

### Action Files
```
src/app/actions/
├── sprints.ts          # createSprint, updateSprint, deleteSprint
├── tasks.ts            # createTask, updateTask, deleteTask
└── index.ts            # Barrel export
```

---

## Type & Interface Naming

### Interfaces

- **Format**: PascalCase, no `I` prefix
- **Examples**:
  - ✓ `interface Sprint {}`
  - ✓ `interface TaskStatus {}`
  - ✗ `interface ISprint {}`

### Types

- **Format**: PascalCase
- **Examples**:
  - ✓ `type SprintId = string`
  - ✓ `type CreateSprintInput = Omit<Sprint, 'id'>`

### Enums

- **Format**: PascalCase
- **Examples**:
  - ✓ `enum SprintStatus {}`
  - ✓ `enum TaskPriority {}`

### Input Types

- **Format**: End with `Input`
- **Examples**:
  - ✓ `CreateSprintInput`
  - ✓ `UpdateTaskInput`

---

## Import Paths

Use path aliases for clean imports:

```typescript
// ✓ Good
import { fetchSprints } from '@/lib/api/sprints'
import { SprintCard } from '@/components/sprints/sprint-card'
import type { Sprint } from '@/types/sprint'

// ✗ Avoid
import { fetchSprints } from '../../../lib/api/sprints'
import { SprintCard } from '../../components/sprints/sprint-card'
```

---

## Summary

| Item        | Format           | Example            |
| ----------- | ---------------- | ------------------ |
| Components  | kebab-case       | `sprint-card.tsx`  |
| Functions   | camelCase        | `fetchSprints.ts`  |
| Directories | kebab-case       | `lib/api`          |
| Constants   | UPPER_SNAKE_CASE | `MAX_RETRIES`      |
| Booleans    | is/has/should    | `isLoading`        |
| Interfaces  | PascalCase       | `interface Sprint` |
| Types       | PascalCase       | `type SprintId`    |
