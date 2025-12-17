# QUICK-REFERENCE

Quick lookup reference for Nexus frontend standards and patterns.

## File Organization

```
src/
├── app/                      # Routes and pages
├── components/               # React components
├── lib/
│   ├── api/                 # API utilities
│   ├── validation/          # Zod schemas
│   ├── hooks/               # Custom hooks
│   └── utils.ts             # Helpers
├── types/                   # TypeScript types
└── contexts/                # React Context
```

---

## Naming Conventions

| Category    | Format           | Example         |
| ----------- | ---------------- | --------------- |
| Components  | PascalCase       | `UserCard.tsx`  |
| Functions   | camelCase        | `getUserData()` |
| Variables   | camelCase        | `userName`      |
| Constants   | UPPER_SNAKE_CASE | `MAX_RETRIES`   |
| Directories | kebab-case       | `user-profile/` |
| Types       | PascalCase       | `UserProps`     |
| Enums       | PascalCase       | `UserStatus`    |

---

## Component Patterns

### Server Component (Default)

```typescript
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

### Client Component

```typescript
'use client'
export default function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### Server Action

```typescript
'use server'
export async function updateSprint(formData: FormData) {
  // Validation and database update
}
```

---

## Data Fetching Patterns

| Scenario   | Pattern       | Location              |
| ---------- | ------------- | --------------------- |
| Read data  | `fetch()`     | Server Component      |
| Watch data | `useSWR()`    | Client Component Hook |
| Mutations  | Server Action | Form submission       |
| Real-time  | WebSocket     | Separate hook         |

---

## Forms Pattern

```typescript
// 1. Define schema in src/lib/validation/
export const mySchema = z.object({
  email: z.string().email(),
})

// 2. Use in Server Action
'use server'
export async function myAction(formData: FormData) {
  const result = mySchema.safeParse(Object.fromEntries(formData))
}

// 3. Build Client Component with React Hook Form
'use client'
export function MyForm() {
  const form = useForm({ resolver: zodResolver(mySchema) })
  // ...
}
```

---

## Key TypeScript Rules

- Always type component props
- Use `type` for unions, `interface` for objects
- Enable strict mode in `tsconfig.json`
- Infer types from Zod: `z.infer<typeof schema>`
- Avoid `any`, use `unknown` if needed

---

## Error Handling

- Use Error Boundaries for component errors
- Handle API errors with try/catch
- Show user-friendly error messages
- Log technical errors for debugging

---

## Performance Optimization Areas

- Images should use Image component with automatic optimization and lazy loading
- Heavy components and routes are lazy loaded with `dynamic()` to reduce initial bundle
- Suspense boundaries wrap async components to show graceful loading states
- Fetch requests use appropriate cache strategies (no-store, revalidate, force-cache)
- Components prevent unnecessary re-renders through proper state management and memoization
- Bundle size is monitored using build tools to catch performance regressions

---

## Code Quality

| Tool       | Command             |
| ---------- | ------------------- |
| Lint       | `pnpm lint:fix`     |
| Format     | `pnpm format`       |
| Type check | `pnpm tsc --noEmit` |
| Test       | `pnpm test`         |
| Build      | `pnpm build`        |

---

## Environment Variables

| Type     | Usage           | Example               |
| -------- | --------------- | --------------------- |
| Public   | `NEXT_PUBLIC_*` | `NEXT_PUBLIC_API_URL` |
| Private  | No prefix       | `DATABASE_URL`        |
| Local    | `.env.local`    | Not committed         |
| Template | `.env.example`  | Committed             |

---

## Testing Coverage Requirements

- Unit tests validate utility functions and business logic with mocked dependencies
- Component tests verify UI elements render correctly and respond to interactions
- Integration tests ensure features work across multiple components
- API responses are mocked to avoid external dependencies in tests
- Error scenarios and edge cases are explicitly tested
- All tests run in CI/CD pipelines on every pull request

---

## Git Workflow

| Task        | Command                                |
| ----------- | -------------------------------------- |
| New feature | `git checkout -b feature/name`         |
| Commit      | `git commit -m "type(scope): message"` |
| Push        | `git push origin feature/name`         |
| Create PR   | `gh pr create`                         |
| Merge       | `git merge --squash`                   |
| Delete      | `git branch -d feature/name`           |

---

## Common Issues & Solutions

### Problem: Re-renders too much
**Solution**: Extract to separate component, use React.memo or useCallback

### Problem: API call runs twice
**Solution**: Remove `<React.StrictMode>` in development or accept it

### Problem: Type error with props
**Solution**: Define PropTypes interface with correct optional fields

### Problem: Validation not working
**Solution**: Ensure Zod schema matches form field names exactly

### Problem: Image not loading
**Solution**: Use Next.js Image component, verify src path, add alt text

---

## Quick Start

1. Create feature branch: `git checkout -b feature/my-feature`
2. Create/update component in `src/components/`
3. Add types in `src/types/`
4. Add validation schemas in `src/lib/validation/`
5. Create Server Actions in `src/app/actions/`
6. Add tests in `*.test.ts` files
7. Run linting: `pnpm lint:fix`
8. Commit: `git commit -m "feat(scope): message"`
9. Push: `git push origin feature/my-feature`
10. Create PR with template

---

## Resources

- [Project Structure](01-project-structure.md)
- [Naming Conventions](02-naming-conventions.md)
- [Component Patterns](03-component-patterns.md)
- [Data Fetching](04-data-fetching.md)
- [API Patterns](05-api-patterns.md)
- [TypeScript & Types](06-typescript-types.md)
- [Environment Variables](07-environment-variables.md)
- [Forms Handling](08-forms.md)
- [Error Handling](09-error-handling.md)
- [Code Quality](10-code-quality.md)
- [Styling](11-styling.md)
- [Performance](12-performance.md)
- [Testing](13-testing.md)
- [Git Workflow](14-git-workflow.md)

---

## Key Principles

1. **Server Components First**: Only use Client Components when needed
2. **Type Safety**: Always use TypeScript strictly
3. **Validation**: Schemas in separate files for reusability
4. **Error Handling**: Handle errors gracefully
5. **Performance**: Optimize images, lazy load, use Suspense
6. **Testing**: Write tests for important features
7. **Code Quality**: Lint and format consistently
8. **Clean Code**: Keep components and functions focused

---

## Version Info

- **Next.js**: 16+
- **React**: 19
- **TypeScript**: 5+
- **Tailwind CSS**: 4+
- **React Hook Form**: 7+
- **Zod**: 3+

---

**Last Updated**: December 17, 2025  
**Repository**: Nexus Frontend
