# 8. Forms Handling

Building forms with React Hook Form and Zod validation.

## Setup

### Install Dependencies

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

---

## Basic Form Pattern

### Define Validation Schema

```typescript
// src/lib/validation/forms.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be 8 characters or longer'),
})

export type LoginInput = z.infer<typeof loginSchema>
```

### Create Server Action

Server Actions follow a 7-step sequencing pattern. See [04 - Data Fetching](04-data-fetching.md) for detailed explanation.

```typescript
// src/app/actions/auth.ts
'use server'

import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { redirect } from 'next/navigation'

// 1. Schema definition
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be 8 characters or longer'),
})

export async function loginAction(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string }> {
  // 2. Input validation
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.success) {
    return {
      error: result.error.errors[0].message,
    }
  }

  try {
    // 3. API call (with error handling)
    const response = await apiClient.post('/auth/login', result.data)

    // 4. Success handling (store token, etc.)
    if (response.data?.token) {
      // Store token in secure cookie, etc.
    }
  } catch (error) {
    // 5. Error handling (return object, don't throw)
    console.error('Login failed:', error)
    return { error: 'Invalid credentials' }
  }

  // 6. Redirect (OUTSIDE try/catch)
  redirect('/dashboard')
}
```

### Build the Form Component

```tsx
// src/components/auth/login-form.tsx
'use client'

import { useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be 8 characters or longer'),
})

type LoginInput = z.infer<typeof loginSchema>

const initialState = {
  error: undefined,
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  )

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          aria-describedby="email-error"
        />
        {form.formState.errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          aria-describedby="password-error"
        />
        {form.formState.errors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {state.error && (
        <p className="text-sm text-red-500" role="alert">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending || !form.formState.isValid}
        className="w-full"
      >
        {isPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
```

---

## Advanced Validation

### Complex Schema with Cross-Field Validation

```typescript
// src/lib/validation/forms.ts
export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be 8 characters')
    .regex(/[A-Z]/, 'Must include uppercase letter')
    .regex(/[0-9]/, 'Must include number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type RegisterInput = z.infer<typeof registerSchema>
```

### Optional Fields

```typescript
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name required'),
  bio: z
    .string()
    .max(500, 'Bio must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Invalid URL')
    .optional()
    .or(z.literal('')),
})
```

---

## Form with File Upload

```tsx
export const uploadAvatarSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be under 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png'].includes(file.type),
      'Only JPEG and PNG files are allowed',
    ),
})

export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>

// Form Component
'use client'

export function AvatarUploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadAvatarAction,
    { error: undefined },
  )

  const form = useForm<UploadAvatarInput>({
    resolver: zodResolver(uploadAvatarSchema),
  })

  return (
    <form action={formAction} className="space-y-4">
      <input
        type="file"
        accept="image/*"
        {...form.register('avatar')}
      />
      {form.formState.errors.avatar && (
        <span>{form.formState.errors.avatar.message}</span>
      )}
      <Button type="submit" disabled={isPending}>
        Upload
      </Button>
    </form>
  )
}
```

---

## Controlled Inputs

Use controlled inputs for dynamic forms:

```tsx
'use client'

export function DynamicForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(mySchema),
    mode: 'onChange',
  })

  const { watch } = form
  const projectType = watch('projectType')

  return (
    <form>
      <select {...form.register('projectType')}>
        <option value="web">Web</option>
        <option value="mobile">Mobile</option>
      </select>

      {projectType === 'web' && (
        <input
          {...form.register('framework')}
          placeholder="React or Vue"
        />
      )}

      {projectType === 'mobile' && (
        <input
          {...form.register('platform')}
          placeholder="iOS or Android"
        />
      )}
    </form>
  )
}
```

---

## Error Display Components

```tsx
// src/components/form-error.tsx
interface FormErrorProps {
  message?: string
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <div className="text-sm text-red-500 mt-1">
      {message}
    </div>
  )
}

// Usage
<FormError message={form.formState.errors.email?.message} />
```

---

## Field Arrays (Dynamic Fields)

```tsx
import { useFieldArray } from 'react-hook-form'

export const projectSchema = z.object({
  name: z.string(),
  team: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
  })),
})

export function ProjectForm() {
  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      team: [{ name: '', email: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'team',
  })

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...form.register(`team.${index}.name`)} />
          <input {...form.register(`team.${index}.email`)} />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ name: '', email: '' })}
      >
        Add Team Member
      </button>
    </form>
  )
}
```

---

## Best Practices

- **Validation schemas**: Define Zod schemas outside Server Actions for client-side and server-side reuse
- **Validation modes**: Use `mode: 'onChange'` for real-time feedback, `onSubmit` for performance
- **Server Actions**: Follow the 7-step sequencing pattern from [04 - Data Fetching](04-data-fetching.md)
- **Error handling**: Return error objects from Server Actions, never throw
- **Error display**: Show one error per field at a time with `aria-describedby`
- **Button states**: Disable submit button while pending to prevent double submissions
- **API calls**: Use `apiClient` from `@/lib/api/client` for all HTTP requests
- **Type inference**: Use `z.infer<typeof schema>` for automatic type generation
- **Accessibility**: Add `role="alert"` to error messages for screen readers
- **Dynamic fields**: Use `useFieldArray` from React Hook Form for efficient rendering

---

## Form Flow

```
User Input
    ↓
React Hook Form captures data
    ↓
Real-time validation with Zod
    ↓
Display errors immediately
    ↓
Submit enabled when valid
    ↓
Form action called on submit
    ↓
Server Action: Validate → Authorize → API call → Revalidate
    ↓
Return error object or redirect
    ↓
UI updates with result
```
