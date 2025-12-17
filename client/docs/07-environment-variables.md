# 7. Environment Variables

Secure configuration management for different environments.

## Setup

### .env.local (NOT committed to git)

```bash
# Local development environment
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nexus
NEXT_PUBLIC_LOG_LEVEL=debug
```

### .env.example (Committed to git)

```bash
# Template for team members - shows structure without secrets
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nexus
NEXT_PUBLIC_LOG_LEVEL=debug
```

### .env.production (For production deployment)

```bash
NEXT_PUBLIC_API_URL=https://api.nexus.com
NEXT_PUBLIC_APP_NAME=Nexus
NEXT_PUBLIC_LOG_LEVEL=error
```

---

## Variable Categories

### Public Variables (Client-Side)

Must have `NEXT_PUBLIC_` prefix - will be inlined in JavaScript bundle:

```typescript
// ✓ Can be used in client components
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// ✓ Can be used in server components
const appName = process.env.NEXT_PUBLIC_APP_NAME
```

### Private Variables (Server-Side Only)

No prefix required - only accessible on server:

```typescript
// ✓ Can only be used in Server Components
const databaseUrl = process.env.DATABASE_URL
const apiSecret = process.env.API_SECRET

// ✗ Cannot be used in Client Components
// ✗ Will cause build error if referenced in client code
```

---

## Usage Patterns

### In Server Components

```typescript
// src/app/layout.tsx
export default function RootLayout() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  return (
    <html>
      <body>
        {/* Use public vars directly */}
      </body>
    </html>
  )
}
```

### In Server Actions

```typescript
// src/app/actions/sprints.ts
'use server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const API_SECRET = process.env.API_SECRET // Server-only

export async function createSprint(_, formData: FormData) {
  const response = await fetch(`${API_URL}/sprints`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_SECRET}`, // Safe - only on server
    },
    body: JSON.stringify(data),
  })

  return response.json()
}
```

### In Client Components

```typescript
// src/components/config.tsx
'use client'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function useApiConfig() {
  return {
    apiUrl: API_URL,
    // Cannot access API_SECRET here
  }
}
```

---

## Typed Environment Variables

Create a type-safe wrapper:

```typescript
// src/lib/env.ts
export const env = {
  // Public variables
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Nexus',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',

  // Server-only variables (only accessible in Server Components)
  databaseUrl: process.env.DATABASE_URL,
  apiSecret: process.env.API_SECRET,
  jwtSecret: process.env.JWT_SECRET,
} as const

// Usage
import { env } from '@/lib/env'

export async function fetchSprints() {
  return fetch(`${env.apiUrl}/sprints`)
}
```

### Validation at Build Time

```typescript
// src/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  DATABASE_URL: z.string().url(),
  API_SECRET: z.string().min(32),
})

const env = envSchema.parse(process.env)

export default env
```

---

## Different Environments

### Development

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nexus Dev
NEXT_PUBLIC_LOG_LEVEL=debug
```

### Staging

```bash
# .env.staging (not committed)
NEXT_PUBLIC_API_URL=https://staging-api.nexus.com
NEXT_PUBLIC_APP_NAME=Nexus Staging
NEXT_PUBLIC_LOG_LEVEL=info
```

### Production

```bash
# Set in deployment platform (Vercel, Docker, etc.)
NEXT_PUBLIC_API_URL=https://api.nexus.com
NEXT_PUBLIC_APP_NAME=Nexus
NEXT_PUBLIC_LOG_LEVEL=error
```

---

## Git Configuration

Update `.gitignore`:

```bash
# .gitignore
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local
```

Only commit `.env.example`:

```bash
# Good - shows structure without secrets
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_NAME=
DATABASE_URL=
API_SECRET=
```

---

## Best Practices

1. **Never commit secrets**: Use `.env.local` locally
2. **Provide templates**: Share `.env.example` with team
3. **Default values**: Provide sensible defaults where possible
4. **Type safety**: Validate environment variables
5. **Prefix public vars**: Use `NEXT_PUBLIC_` for client access
6. **Server secrets**: Keep secrets in server-only variables
7. **Documentation**: Document what each variable does

---

## Security Tips

1. Rotate secrets regularly
2. Use strong, unique values for secrets
3. Never log secrets to console
4. Use secret management tools in production
5. Limit secret access to necessary services only
6. Audit who has access to secrets
