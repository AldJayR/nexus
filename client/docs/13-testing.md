# 13. Testing

Testing standards and patterns.

## Unit Tests

Use Vitest for unit testing:

```bash
pnpm add -D vitest @vitest/ui
```

### Test Utilities

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, calculateMetrics } from './utils'

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('Jan 15, 2024')
  })

  it('handles invalid dates', () => {
    expect(formatDate(new Date('invalid'))).toBe('Invalid date')
  })
})

describe('calculateMetrics', () => {
  it('calculates sum correctly', () => {
    const result = calculateMetrics([1, 2, 3])
    expect(result.sum).toBe(6)
  })

  it('returns 0 for empty array', () => {
    const result = calculateMetrics([])
    expect(result.sum).toBe(0)
  })
})
```

---

## Component Tests

```typescript
// src/components/sprints/sprint-card.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SprintCard } from './sprint-card'

describe('SprintCard', () => {
  const mockSprint = {
    id: '1',
    name: 'Sprint 1',
    status: 'ACTIVE',
    startDate: '2024-01-01',
    endDate: '2024-01-15',
  }

  it('renders sprint name', () => {
    render(<SprintCard sprint={mockSprint} />)
    expect(screen.getByText('Sprint 1')).toBeInTheDocument()
  })

  it('displays sprint status', () => {
    render(<SprintCard sprint={mockSprint} />)
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', () => {
    const handleEdit = vi.fn()
    render(
      <SprintCard
        sprint={mockSprint}
        onEdit={handleEdit}
      />
    )
    const editButton = screen.getByRole('button', { name: /edit/i })
    editButton.click()
    expect(handleEdit).toHaveBeenCalledWith(mockSprint)
  })
})
```

---

## API Testing with Axios

Mock axios instances for testing API calls:

```bash
pnpm add -D axios-mock-adapter
```

```typescript
// src/lib/api/__tests__/sprints.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { apiClient } from '@/lib/api/client'
import { fetchSprints, createSprint } from '../sprints'

describe('Sprint API', () => {
  let mockAxios: MockAdapter

  beforeEach(() => {
    mockAxios = new MockAdapter(apiClient)
  })

  afterEach(() => {
    mockAxios.reset()
  })

  describe('fetchSprints', () => {
    it('fetches all sprints', async () => {
      const mockData = [{ id: '1', name: 'Sprint 1', status: 'ACTIVE' }]
      mockAxios.onGet('/sprints').reply(200, mockData)

      const sprints = await fetchSprints()
      expect(sprints).toEqual(mockData)
    })

    it('throws error on failed request', async () => {
      mockAxios.onGet('/sprints').reply(500)

      await expect(fetchSprints()).rejects.toThrow()
    })

    it('handles 401 unauthorized', async () => {
      mockAxios.onGet('/sprints').reply(401)

      await expect(fetchSprints()).rejects.toThrow()
    })
  })

  describe('createSprint', () => {
    it('creates sprint with data', async () => {
      const newSprint = { name: 'New Sprint', startDate: '2024-01-01' }
      const created = { id: '2', ...newSprint }
      mockAxios.onPost('/sprints', newSprint).reply(201, created)

      const result = await createSprint(newSprint)
      expect(result.id).toBe('2')
      expect(result.name).toBe('New Sprint')
    })

    it('handles validation errors', async () => {
      mockAxios.onPost('/sprints').reply(400, {
        message: 'Invalid sprint data',
      })

      await expect(createSprint({})).rejects.toThrow()
    })
  })
})
```

---

## Form Testing

```typescript
// src/components/auth/login-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './login-form'

describe('LoginForm', () => {
  it('shows validation errors', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockAction = vi.fn()

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled()
    })
  })
})
```

---

## E2E Tests

```typescript
// e2e/sprints.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Sprints Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sprints')
  })

  test('displays sprints list', async ({ page }) => {
    await expect(page.getByText(/sprints/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create sprint/i })).toBeVisible()
  })

  test('creates new sprint', async ({ page }) => {
    await page.getByRole('button', { name: /create sprint/i }).click()
    await page.getByLabel(/sprint name/i).fill('New Sprint')
    await page.getByRole('button', { name: /create/i }).click()

    await expect(page.getByText('New Sprint')).toBeVisible()
  })

  test('edits sprint', async ({ page }) => {
    await page.getByRole('button', { name: /edit/i }).first().click()
    await page.getByLabel(/sprint name/i).clear()
    await page.getByLabel(/sprint name/i).fill('Updated Sprint')
    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByText('Updated Sprint')).toBeVisible()
  })
})
```

---

## Test Configuration

```bash
# vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Best Practices

1. **Test behavior**: Test what users do, not implementation details
2. **Mock external services**: Mock API calls in tests
3. **Use descriptive names**: Test names should explain what's tested
4. **Keep tests focused**: One assertion per test when possible
5. **Use setup files**: Share test utilities and configuration
6. **Test error cases**: Don't just test happy paths
7. **Maintain tests**: Update tests when requirements change
8. **Aim for coverage**: Target 80%+ code coverage

---

## Testing Coverage Areas

Comprehensive testing covers these levels:

- Unit tests validate utility functions and business logic in isolation with mocked dependencies
- Component tests verify UI components render correctly and respond to user interactions
- Integration tests ensure multiple components work together to achieve feature goals
- End-to-end tests simulate real user workflows through the application
- Error cases are explicitly tested to verify proper error handling and user feedback
- API responses are mocked in tests to avoid external dependencies and enable consistent testing
- All tests run in CI/CD pipelines on every pull request to catch regressions early
- Code coverage is monitored to identify untested code paths, targeting 70%+ coverage
