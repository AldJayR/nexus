# Nexus Frontend - Next.js Standards & Best Practices

Complete standards and best practices documentation for the Nexus frontend project.

## Quick Navigation

### Foundation
- [01 - Project Structure](01-project-structure.md) - Folder organization and file layout
- [02 - Naming Conventions](02-naming-conventions.md) - Naming standards for files, functions, types

### Development
- [03 - Component Patterns](03-component-patterns.md) - Server/Client components and Server Actions
- [04 - Data Fetching](04-data-fetching.md) - Server-side and client-side patterns
- [05 - API Patterns](05-api-patterns.md) - Organized API utilities
- [06 - TypeScript & Types](06-typescript-types.md) - Type safety and validation

### Configuration
- [07 - Environment Variables](07-environment-variables.md) - Configuration and secrets
- [10 - Code Quality](10-code-quality.md) - ESLint and linting setup
- [11 - Styling](11-styling.md) - Tailwind CSS standards

### Features & Practices
- [08 - Forms Handling](08-forms.md) - React Hook Form + Zod patterns
- [09 - Error Handling](09-error-handling.md) - Error boundaries and pages
- [12 - Performance](12-performance.md) - Optimization practices
- [13 - Testing](13-testing.md) - Testing standards

### Workflow
- [14 - Git Workflow](14-git-workflow.md) - Branch naming and commits
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - Quick lookup reference

---

## Key Principles

1. **Default to Server Components** - Use Server Components unless you need interactivity
2. **Separation of Concerns** - Keep validation, API calls, and components organized
3. **Type Safety** - Always use TypeScript with proper typing
4. **Real-time Validation** - Use React Hook Form with `mode: 'onChange'`
5. **Consistent Naming** - Follow conventions: PascalCase for components, camelCase for functions
6. **Error Handling** - Handle errors gracefully with boundaries and user feedback
7. **Performance First** - Optimize images, use dynamic imports, implement Suspense

---

## Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **Linting**: ESLint or Biome
- **Data Fetching**: fetch API + SWR

---

## File Organization

```
src/
├── app/                      # App Router routes
├── components/               # React components
├── lib/
│   ├── api/                 # API utilities
│   ├── validation/          # Zod schemas
│   ├── hooks/               # Custom hooks
│   └── utils.ts
├── types/                   # TypeScript definitions
├── contexts/                # React Context
├── constants/               # App constants
└── middleware.ts
```

---

## Getting Started

1. Read [Project Structure](01-project-structure.md) for folder layout
2. Review [Naming Conventions](02-naming-conventions.md) for consistency
3. Check [Component Patterns](03-component-patterns.md) for building components
4. See [Forms Handling](08-forms.md) when building forms
5. Use [QUICK-REFERENCE.md](QUICK-REFERENCE.md) for quick lookups

---

**Version**: 1.0  
**Last Updated**: December 17, 2025
