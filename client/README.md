💀

```
client/
├── app/
│   ├── (auth)/                          # Protected routes group
│   │   ├── layout.tsx                   # Header, Sidebar, Navigation
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── phases/
│   │   │   └── page.tsx
│   │   ├── sprints/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx             # Task board for sprint
│   │   │       └── layout.tsx
│   │   ├── meetings/
│   │   │   └── page.tsx
│   │   ├── deliverables/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── team-members/
│   │       │   └── page.tsx
│   │       ├── project-config/
│   │       │   └── page.tsx
│   │       └── backup/
│   │           └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── layout.tsx                       # Root layout
│   ├── globals.css
│   ├── robots.ts
│   ├── sitemap.ts
│   └── not-found.tsx
│
├── components/
│   ├── ui/                              # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── sidebar.tsx
│   │   ├── avatar.tsx
│   │   └── ... (other shadcn components)
│   │
│   ├── layouts/
│   │   ├── app-header.tsx
│   │   ├── app-sidebar.tsx
│   │   └── breadcrumb.tsx
│   │
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── logout-button.tsx
│   │
│   ├── dashboard/
│   │   ├── progress-card.tsx
│   │   ├── phase-tracker.tsx
│   │   ├── sprint-health.tsx
│   │   ├── activity-feed.tsx
│   │   └── completion-chart.tsx
│   │
│   ├── phases/
│   │   ├── phase-list.tsx
│   │   ├── phase-card.tsx
│   │   ├── deliverable-item.tsx
│   │   └── deliverable-form.tsx
│   │
│   ├── sprints/
│   │   ├── sprint-list.tsx
│   │   ├── sprint-card.tsx
│   │   ├── task-board.tsx
│   │   ├── task-card.tsx
│   │   ├── task-form.tsx
│   │   └── task-status-badge.tsx
│   │
│   ├── deliverables/
│   │   ├── deliverable-list.tsx
│   │   ├── evidence-upload.tsx
│   │   ├── comment-section.tsx
│   │   └── evidence-gallery.tsx
│   │
│   ├── meetings/
│   │   ├── meetings-list.tsx
│   │   ├── meeting-card.tsx
│   │   ├── pdf-upload.tsx
│   │   └── pdf-viewer.tsx
│   │
│   ├── settings/
│   │   ├── project-form.tsx
│   │   ├── team-member-invite.tsx
│   │   ├── team-member-list.tsx
│   │   ├── team-member-row.tsx
│   │   ├── backup-controls.tsx
│   │   └── user-role-badge.tsx
│   │
│   └── common/
│       ├── loading-skeleton.tsx
│       ├── empty-state.tsx
│       ├── error-boundary.tsx
│       └── confirmation-dialog.tsx
│
├── hooks/
│   ├── use-mobile.ts                   # (from shadcn)
│   ├── use-auth.ts                     # Current user context
│   ├── use-api.ts                      # API request wrapper
│   ├── use-notification.ts             # Toast/alert notifications
│   ├── use-file-upload.ts              # File upload handler
│   ├── use-form-state.ts               # Form state management
│   └── use-sidebar.ts                  # Sidebar state (from shadcn)
│
├── lib/
│   ├── api.ts                          # Fetch wrapper + base URL
│   ├── utils.ts                        # cn(), formatting utilities
│   ├── constants.ts                    # App-wide constants
│   ├── validation.ts                   # Zod schemas for forms
│   └── date-utils.ts                   # Date formatting helpers
│
├── types/
│   ├── auth.ts                         # User, Role types
│   ├── phase.ts                        # Phase, Deliverable types
│   ├── sprint.ts                       # Sprint, Task types
│   ├── project.ts                      # Project types
│   ├── comment.ts                      # Comment types
│   ├── meeting.ts                      # Meeting log types
│   ├── api.ts                          # API request/response types
│   └── index.ts                        # Barrel export
│
├── contexts/
│   ├── auth-context.tsx                # User auth state
│   └── notification-context.tsx        # Toast notifications
│
├── proxy.ts                            # Route protection
├── .env.local                          # Local environment variables
├── .env.example                        # Template for env vars
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── package.json
└── pnpm-lock.yaml
```
