# 1. Project Structure

This document outlines the recommended folder organization for the Nexus frontend project.

## Root Level Organization

```
client/
├── src/                          # Source code root (improves organization)
│   ├── app/                      # App Router - main application routes
│   ├── components/               # Shared React components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions, helpers, API clients
│   ├── types/                    # TypeScript type definitions
│   ├── contexts/                 # React Context providers
│   ├── constants/                # Application constants
│   └── middleware.ts             # Request middleware
├── public/                       # Static assets
├── docs/                         # Documentation
├── .env.local                    # Local environment variables (NOT committed)
├── .env.example                  # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
└── biome.jsonc
```

## App Directory Structure

```
src/app/
├── (auth)/                       # Route group - authenticated routes
│   ├── layout.tsx                # Auth layout (header, sidebar)
│   ├── dashboard/
│   │   ├── page.tsx              # /dashboard
│   │   └── _components/          # Dashboard-specific components
│   ├── sprints/
│   │   ├── page.tsx              # /sprints
│   │   ├── [id]/
│   │   │   ├── page.tsx          # /sprints/[id]
│   │   │   └── layout.tsx
│   │   └── _components/
│   ├── phases/
│   │   ├── page.tsx
│   │   └── _components/
│   ├── meetings/
│   │   ├── page.tsx
│   │   └── _components/
│   ├── deliverables/
│   │   ├── page.tsx
│   │   └── _components/
│   └── settings/
│       ├── page.tsx
│       └── _components/
├── login/
│   └── page.tsx                  # /login
├── layout.tsx                    # Root layout
├── page.tsx                      # / (home)
├── not-found.tsx                 # 404 page
├── error.tsx                     # Error boundary
└── global-error.tsx              # Root error boundary
```

## Components Organization

```
src/components/
├── ui/                           # Shadcn UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── field.tsx
│   └── ...
├── layouts/                      # Layout wrappers
│   ├── app-header.tsx
│   ├── app-sidebar.tsx
│   └── breadcrumb.tsx
├── forms/                        # Form components
│   ├── sprint-form.tsx
│   ├── task-form.tsx
│   └── auth-form.tsx
├── common/                       # Shared reusable
│   ├── loading-skeleton.tsx
│   ├── empty-state.tsx
│   ├── error-boundary.tsx
│   └── confirmation-dialog.tsx
├── dashboard/                    # Feature-specific
│   ├── progress-card.tsx
│   ├── phase-tracker.tsx
│   └── activity-feed.tsx
├── sprints/
│   ├── sprint-list.tsx
│   ├── sprint-card.tsx
│   ├── task-board.tsx
│   ├── task-card.tsx
│   └── task-form.tsx
├── phases/
│   ├── phase-list.tsx
│   └── deliverable-item.tsx
└── auth/
    ├── login-form.tsx
    └── logout-button.tsx
```

## Libraries & Utilities

```
src/lib/
├── api/                          # API utilities
│   ├── auth.ts
│   ├── projects.ts
│   ├── sprints.ts
│   ├── tasks.ts
│   ├── deliverables.ts
│   └── index.ts
├── validation/                   # Zod validation schemas
│   ├── sprint.ts
│   ├── task.ts
│   ├── auth.ts
│   └── index.ts
├── hooks/                        # Custom hooks
│   ├── use-api.ts
│   ├── use-auth.ts
│   └── index.ts
├── utils.ts                      # Common utilities
├── constants.ts                  # App constants
└── date-utils.ts                 # Date helpers
```

## Server Actions

```
src/app/actions/
├── auth.ts                       # Auth mutations
├── sprints.ts                    # Sprint mutations
├── tasks.ts                      # Task mutations
├── deliverables.ts               # Deliverable mutations
└── index.ts                      # Barrel export
```

## Types

```
src/types/
├── sprint.ts
├── task.ts
├── project.ts
├── user.ts
├── auth.ts
└── index.ts
```

## Benefits of This Structure

- **Colocation**: Related files are grouped together
- **Scalability**: Easy to add new features
- **Clarity**: Clear separation of concerns
- **Navigation**: Intuitive folder hierarchy
- **Modularity**: Feature folders are self-contained
