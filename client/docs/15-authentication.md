# 15. Authentication Setup

Complete guide to client-side authentication implementation using proxy, server actions, and JWT tokens.

## Overview

Authentication is implemented using:
- `proxy.ts` - Route protection and JWT verification (replaced `middleware.ts` in Next.js 16+)
- Server Actions - Secure login/logout operations
- JWT tokens - Stored in httpOnly cookies
- Auth Context - Client-side state management

## File Structure

```
lib/
  types/auth.ts          # Auth types and interfaces
  validation/auth.ts     # Zod schemas
  api/
    client.ts            # Axios configuration
    auth.ts              # Auth API calls
  hooks/useAuth.ts       # Client-side utilities
  contexts/AuthContext.tsx  # Auth provider

app/
  actions/auth.ts        # Server actions (secure)
  login/page.tsx         # Login page
  layout.tsx             # Root layout with AuthProvider

proxy.ts                 # Route protection (Next.js 16+)
```

## Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_SECRET=your-jwt-secret-key
```

## Key Components

### proxy.ts (Route Protection)

Replaces `middleware.ts` in Next.js 16+. Protects all routes except `/login` and `/`.

```typescript
// Uses JWT verification to protect routes
// Redirects unauthenticated users to login
// Automatically clears expired tokens
```

### Server Actions (app/actions/auth.ts)

Secure operations on the server:

```typescript
export async function loginAction(prevState, formData)
export async function logoutAction()
export async function getAuthUser()
```

### Auth Context

Client-side state management:

```typescript
const { user, isAuthenticated, isLoading, logout } = useAuth()
```

## Login Flow

1. User submits credentials in `LoginForm`
2. Zod validates input
3. `loginAction` (server action) validates and calls API
4. API returns JWT token + user data
5. Token stored in httpOnly cookie (secure from XSS)
6. User data stored in regular cookie (accessible)
7. Redirect to dashboard on success
8. On subsequent requests, `proxy.ts` verifies token

## Protected Routes

All routes under `/app/(auth)/` are protected:

```typescript
// This is protected - requires valid JWT
export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')
  // ...
}
```

## Using Auth in Components

Client component:

```typescript
'use client'
import { useAuth } from '@/lib/contexts/AuthContext'

export function Header() {
  const { user, logout } = useAuth()
  return <div>{user?.name}</div>
}
```

Server component:

```typescript
import { getAuthUser } from '@/app/actions/auth'

export default async function Page() {
  const user = await getAuthUser()
  // ...
}
```

## Migration Note (Next.js 16+)

In Next.js 16, `middleware.ts` was renamed to `proxy.ts`. The function signature changed:

```typescript
// Old (Next.js <16)
export async function middleware(request: NextRequest) { }

// New (Next.js 16+)
export async function proxy(request: NextRequest) { }
```

This aligns with Next.js moving away from middleware terminology to clarify the proxy's purpose as a network boundary interceptor.

## Integration with Backend

Backend must provide these endpoints:

- `POST /auth/login` - Returns `{ user, token }`
- `GET /auth/verify` - Verifies token validity
- `GET /auth/me` - Returns current user
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout user

## Security Considerations

- JWT tokens in httpOnly cookies (immune to XSS)
- Tokens marked as secure in production
- Automatic token verification on protected routes
- Expired tokens trigger redirect to login
- Passwords validated client-side before sending
- Server actions handle sensitive operations
- CORS properly configured
