# 15. Authentication & Data Security

Complete guide to authentication implementation following Next.js best practices for security and data protection.

## Overview

This project implements authentication following Next.js recommendations for secure data handling in Server Components. Understanding authentication requires breaking it down into three core concepts:

1. **Authentication**: Verifies if the user is who they say they are (username + password)
2. **Session Management**: Tracks the user's auth state across requests (JWT in httpOnly cookies)
3. **Authorization**: Decides what routes and data the user can access (role-based access control)

## Architecture Pattern

We follow the **External HTTP APIs** pattern, recommended by Next.js for existing large applications:

- External Fastify backend with separate API
- Zero Trust model (all requests validated)
- Server Actions call authenticated API endpoints
- Security practices maintained at backend level

This approach works well when:
- You already have security practices in place
- Backend team manages APIs independently
- You want clear separation of concerns

## Security Features

### Built-in Next.js Security

**Server Actions Protection:**
- Encrypted, non-deterministic action IDs
- Dead code elimination for unused actions
- POST-only HTTP method
- CSRF protection via Origin/Host header comparison

**Session Management:**
- JWT tokens stored in httpOnly cookies (XSS protection)
- 7-day token expiration
- Automatic token verification on each request

### Application-Level Security

**Server-Only Code:**
```typescript
// auth.ts - marked with "server-only"
import "server-only";
// Prevents bundling this code for client
```

**Input Validation:**
```typescript
// All Server Actions validate input with Zod
const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

**Error Handling:**
- Generic messages for auth failures (prevents user enumeration)
- No system internals exposed to client
- Security-conscious error codes

**Data Transfer Objects (DTOs):**
- Server Actions return minimal, sanitized data
- No raw database objects passed to client
- Type-safe interfaces for all responses

## File Structure

```
lib/
  types/auth.ts          # Auth types and interfaces (DTOs)
  validation/auth.ts     # Zod schemas for validation
  helpers/auth-errors.ts # Security-conscious error mapping
  api/
    client.ts            # Axios with token injection
    auth.ts              # Auth API calls

actions/
  login.ts               # Server Action (marked "use server")
  logout.ts              # Server Action
  user.ts                # Server Action for user data

components/
  providers/
    auth-provider.tsx    # Centralized authorization check

app/
  (auth)/                # Protected routes group
    layout.tsx           # Wraps with AuthProvider
  login/
    page.tsx             # Public login page

auth.ts                  # Server-only auth utilities
proxy.ts                 # Pathname injection for Server Components
```

## Core Concepts

### 1. Authentication (Login)

**Login Flow:**
1. User submits credentials via form
2. Client-side Zod validates input
3. Server Action (`loginAction`) receives data
4. Server Action validates again (never trust client)
5. API call to backend with credentials
6. Backend verifies with bcrypt + JWT generation
7. Token stored in httpOnly cookie
8. Redirect to dashboard on success

**Implementation:**

```typescript
// actions/login.ts
"use server";

export async function loginAction(input: unknown): Promise<LoginActionResponse> {
  // 1. Validate input
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    // 2. Call backend API
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.AUTH.LOGIN, parsed.data);

    // 3. Store token in httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 4. Redirect on success
    redirect("/dashboard");
  } catch (error) {
    // 5. Return user-friendly errors (security-conscious)
    return {
      success: false,
      authError: createAuthError(error),
    };
  }
}
```

**Security Considerations:**
- Validation happens twice (client + server)
- Generic error messages (prevent user enumeration)
- httpOnly cookies (protect from XSS)
- Secure flag in production (HTTPS only)
- SameSite=lax (CSRF protection)

### 2. Session Management

**Session Verification:**

```typescript
// auth.ts (marked "server-only")
import "server-only";

export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    // Decode JWT (jose library)
    const decoded = decodeJwt(token);
    
    // Verify and call backend for fresh user data
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.AUTH.ME);
    
    return {
      user: response.data,
      token,
    };
  } catch {
    return null;
  }
}
```

**Server Actions for User Data:**

```typescript
// actions/user.ts
"use server";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.AUTH.ME);
    return response.data; // Returns DTO, not raw database object
  } catch {
    return null; // Graceful failure, no error exposure
  }
}
```

**Best Practices:**
- Session check returns null on failure (no exceptions)
- Fresh data fetched from API (no stale sessions)
- Minimal user data in cookies
- Token verification on every request

### 3. Authorization (Access Control)

**Layout Structure:**

Auth protection happens at the route group level, not the root:

```
app/
  layout.tsx                          # ❌ NO AuthProvider (allows login page)
  login/page.tsx                      # Public - no auth required
  (auth)/                             # Protected routes group
    layout.tsx                        # ✅ Auth check here
    dashboard/page.tsx
    admin/page.tsx
```

**Why no AuthProvider at root:**
- Root layout renders for ALL users (authenticated + public)
- Login page must be accessible without auth
- Auth check at layout level prevents unnecessary API calls

**Implementation Approach (Our App):**

Since our (auth) layout uses slot-based routing (`@member`, `@team-lead`, `@adviser`), we call `auth()` directly instead of wrapping with AuthProvider:

```typescript
// app/(auth)/layout.tsx
import { auth } from "@/auth";

export default async function AuthLayout({
  children,
  member,
  "team-lead": teamLead,
  adviser,
}: {
  children: ReactNode;
  member: ReactNode;
  "team-lead": ReactNode;
  adviser: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    unauthorized();
  }

  // Use session to determine which slot to render
  const currentRole = session.user.role;
  
  switch (currentRole) {
    case "member":
      return <>{member}</>;
    case "teamLead":
      return <>{teamLead}</>;
    case "adviser":
      return <>{adviser}</>;
  }
}
```

**Alternative Approach (Simpler layouts):**

For layouts that don't need session data, use AuthProvider:

```typescript
// app/(auth)/layout.tsx (simple case)
import { AuthProvider } from "@/components/providers/auth-provider";

export default async function AuthLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

**Centralized Authorization:**

```typescript
// components/providers/auth-provider.tsx
export async function AuthProvider({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    unauthorized(); // Next.js 401 handler
  }

  return <>{children}</>;
}
```

**Layout-Level Protection:**

```typescript
// app/(auth)/layout.tsx
export default async function AuthLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

**Role-Based Access:**

```typescript
// Check role in Server Component
export default async function AdminPage() {
  const session = await auth();
  
  if (session?.user?.role !== "teamLead") {
    unauthorized();
  }
  
  return <AdminDashboard />;
}
```

**Authorization Best Practices:**
- Single auth check per request (at layout level)
- Uses Next.js `unauthorized()` for proper 401 handling
- Role checks where needed
- No client-side auth state management needed

## Data Security Practices

### Preventing Data Exposure

**Data Transfer Objects (DTOs):**
- Never pass raw database objects to Client Components
- Always return minimal, sanitized data from Server Actions
- Use TypeScript interfaces to enforce structure

```typescript
// GOOD: Minimal DTO
export interface User {
  id: string;
  email: string;
  name: string;
  role: AppRole;
}

// BAD: Would expose sensitive fields
interface UserWithPassword {
  id: string;
  email: string;
  passwordHash: string; // ❌ Never expose
  // ...
}
```

**Server-Only Modules:**
```typescript
// auth.ts
import "server-only";
// This file cannot be imported by Client Components
// Build will fail if attempted
```

**Error Handling:**
```typescript
// lib/helpers/auth-errors.ts
// Generic messages to prevent information leakage
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]:
    "Invalid email or password. Please check your credentials and try again.",
  // Not: "User not found" or "Wrong password" (reveals too much)
};
```

### Advanced Security (Future Consideration)

**React Taint APIs:**
For additional protection against accidental data exposure:

```typescript
import { experimental_taintObjectReference } from 'react';

// Prevent entire objects from reaching client
experimental_taintObjectReference(
  'Do not pass user object to client',
  user
);
```

**Server Action Encryption Keys:**
For multi-server deployments, consider:

```env
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=your-aes-gcm-key
```

This ensures consistent encryption across server instances.

## Environment Variables

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Server-only secrets (no NEXT_PUBLIC_ prefix)
JWT_SECRET=your-jwt-secret-key
DATABASE_URL=postgresql://...

# Public variables (exposed to client)
NEXT_PUBLIC_APP_NAME=Nexus
```

**Security Notes:**
- Only `NEXT_PUBLIC_*` variables are exposed to client
- Server-only secrets stay on server
- Never commit `.env.local` to version control

## Complete Login Flow Example

### 1. Login Form Component

```typescript
// components/auth/login-form.tsx
'use client';

import { useActionState } from 'react';
import { loginAction } from '@/actions/login';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction}>
      <input 
        name="email" 
        type="email" 
        required 
        disabled={isPending}
      />
      {state?.fieldErrors?.email && (
        <span>{state.fieldErrors.email}</span>
      )}
      
      <input 
        name="password" 
        type="password" 
        required 
        disabled={isPending}
      />
      {state?.fieldErrors?.password && (
        <span>{state.fieldErrors.password}</span>
      )}

      {state?.authError && (
        <div>{state.authError.message}</div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
```

### 2. Login Server Action

```typescript
// actions/login.ts
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createAuthError } from "@/lib/helpers/auth-errors";

const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(input: unknown) {
  // Validate input
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // Call backend
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.AUTH.LOGIN, parsed.data);

    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Redirect throws NEXT_REDIRECT (expected)
    redirect("/dashboard");
  } catch (error) {
    // Return user-friendly error
    return {
      success: false,
      authError: createAuthError(error),
    };
  }
}
```

### 3. Protected Layout

```typescript
// app/(auth)/layout.tsx
import { AuthProvider } from "@/components/providers/auth-provider";

export default async function AuthLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### 4. Auth Provider

```typescript
// components/providers/auth-provider.tsx
import "server-only"; // Optional but recommended
import { unauthorized } from "next/navigation";
import { auth } from "@/auth";

export async function AuthProvider({ children }) {
  const session = await auth();

  if (!session?.user) {
    unauthorized();
  }

  return <>{children}</>;
}
```

## Using Auth in Server Components

```typescript
// app/(auth)/dashboard/page.tsx
import { auth } from "@/auth";
import { getCurrentUser } from "@/actions/user";

export default async function DashboardPage() {
  // Option 1: Use auth() directly
  const session = await auth();
  console.log(session.user.name);

  // Option 2: Use Server Action
  const user = await getCurrentUser();
  console.log(user?.email);

  return <Dashboard user={session.user} />;
}
```

## Security Audit Checklist

When reviewing authentication code:

- [ ] **Server Actions**: All marked with `"use server"`
- [ ] **Input Validation**: Zod schemas validate all user input
- [ ] **Authorization**: Every protected route has auth check
- [ ] **DTOs**: No raw database objects passed to client
- [ ] **Error Messages**: Generic messages for auth failures
- [ ] **Cookies**: httpOnly flag set for tokens
- [ ] **Environment Variables**: Secrets not prefixed with `NEXT_PUBLIC_`
- [ ] **Server-Only**: Auth utilities marked with `"server-only"`
- [ ] **CSRF Protection**: Server Actions use POST method automatically
- [ ] **Role Checks**: Authorization logic verifies user roles

## Common Patterns

### Logout

```typescript
// actions/logout.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}
```

### Role-Based Access

```typescript
// app/(auth)/admin/page.tsx
import { auth } from "@/auth";
import { unauthorized } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  
  if (session?.user?.role !== "teamLead") {
    unauthorized();
  }
  
  return <AdminDashboard />;
}
```

### Conditional Rendering Based on Role

```typescript
// Server Component
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session.user.role === "teamLead";

  return (
    <div>
      <h1>Dashboard</h1>
      {isAdmin && <AdminPanel />}
      {!isAdmin && <MemberPanel />}
    </div>
  );
}
```

## Backend Integration Requirements

Backend must provide these endpoints:

- `POST /auth/login` - Returns `{ user, token }`
- `GET /auth/me` - Returns current user data
- `POST /auth/logout` - Optional backend logout
- `POST /auth/refresh` - Optional token refresh

**Backend Security Requirements:**
- bcrypt password hashing (cost factor 10+)
- JWT signing with strong secret
- Token expiration (7 days recommended)
- Account deactivation checks
- Rate limiting on login endpoint

## Migration Notes

### From Next.js <16

In Next.js 16, `middleware.ts` was renamed to `proxy.ts`:

```typescript
// Old (Next.js <16)
export async function middleware(request: NextRequest) { }

// New (Next.js 16+)
export async function proxy(request: NextRequest) { }
```

### From Client-Side Auth

If migrating from client-side auth (React Context, useState):

1. Move auth logic to Server Actions
2. Replace React Context with Server Components
3. Use cookies instead of localStorage
4. Add "use server" to all auth functions
5. Use AuthProvider at layout level

## Best Practices Summary

✅ **DO:**
- Use Server Actions for all mutations
- Validate input on both client and server
- Store tokens in httpOnly cookies
- Return minimal DTOs from Server Actions
- Use generic error messages for auth failures
- Check authorization in every protected route
- Mark auth utilities with "server-only"

❌ **DON'T:**
- Expose system internals in error messages
- Pass raw database objects to Client Components
- Store tokens in localStorage or regular cookies
- Trust client-side validation alone
- Reveal whether emails exist in system
- Skip authorization checks
- Bundle server secrets for client

## References

- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [Next.js Data Security](https://nextjs.org/docs/app/guides/data-security)
- [Server Actions Security](https://nextjs.org/blog/security-nextjs-server-components-actions)
- [React Server Components](https://react.dev/reference/rsc/server-components)

---

**Last Updated**: December 2025  
**Next.js Version**: 16.1.0
