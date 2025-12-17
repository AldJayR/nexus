# 12. Performance

Performance optimization best practices.

## Image Optimization

Use Next.js Image component:

```typescript
// ✗ Avoid - uses native img tag
<img src="/banner.jpg" alt="Banner" width={1200} height={600} />

// ✓ Good - uses Next.js optimized Image component
import Image from 'next/image'

<Image
  src="/banner.jpg"
  alt="Banner"
  width={1200}
  height={600}
  priority // For above-the-fold images
/>
```

### Image Best Practices

```typescript
import Image from 'next/image'

export function ProductImage() {
  return (
    <div className="relative w-full h-96">
      <Image
        src="/product.jpg"
        alt="Product"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;..." // Optional
      />
    </div>
  )
}
```

---

## Lazy Loading

Use dynamic imports for code splitting:

```typescript
// Heavy component
import { ChartComponent } from '@/components/charts/heavy-chart'

// Better - loads only when needed
import dynamic from 'next/dynamic'

const ChartComponent = dynamic(
  () => import('@/components/charts/heavy-chart'),
  { ssr: false, loading: () => <div>Loading chart...</div> }
)

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ChartComponent />
    </div>
  )
}
```

---

## Suspense for Streaming

Use Suspense boundaries to stream content:

```typescript
import { Suspense } from 'react'
import { SprintCard } from '@/components/sprints/sprint-card'
import { Skeleton } from '@/components/ui/skeleton'

async function SprintList() {
  const sprints = await fetchSprints()
  return (
    <div className="grid gap-4">
      {sprints.map((sprint) => (
        <SprintCard key={sprint.id} sprint={sprint} />
      ))}
    </div>
  )
}

export function Page() {
  return (
    <Suspense fallback={<Skeleton count={3} />}>
      <SprintList />
    </Suspense>
  )
}
```

---

## Route Caching

Configure caching strategies:

```typescript
// src/app/sprints/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds

export async function generateStaticParams() {
  const sprints = await fetchSprints()
  return sprints.map((sprint) => ({
    id: sprint.id,
  }))
}

export default async function Page({ params }: { params: { id: string } }) {
  const sprint = await fetchSprint(params.id)
  return <SprintDetail sprint={sprint} />
}
```

---

## Minimize Bundle Size

### Tree Shaking

```typescript
// ✗ Avoid - imports entire library
import * as utils from '@/lib/utils'
const result = utils.calculateMetrics()

// ✓ Good - imports only needed function
import { calculateMetrics } from '@/lib/utils'
const result = calculateMetrics()
```

### Analyze Bundle

```bash
pnpm add -D @next/bundle-analyzer

// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({})

// Run: ANALYZE=true pnpm build
```

---

## Reduce Re-renders

### Use React.memo for Components

```typescript
// Don't re-render if props haven't changed
const SprintCard = React.memo(({ sprint }: SprintCardProps) => {
  return <div>{sprint.name}</div>
})
```

### Use useCallback for Functions

```typescript
'use client'

import { useCallback } from 'react'

export function Parent() {
  const handleUpdate = useCallback((id: string) => {
    // This function reference doesn't change
    updateSprint(id)
  }, [])

  return <Child onUpdate={handleUpdate} />
}
```

### Use useMemo for Expensive Calculations

```typescript
'use client'

import { useMemo } from 'react'

export function Dashboard({ sprints }: { sprints: Sprint[] }) {
  const totalPoints = useMemo(
    () => sprints.reduce((sum, s) => sum + s.points, 0),
    [sprints],
  )

  return <div>Total: {totalPoints}</div>
}
```

---

## Optimize Fonts

```typescript
// src/app/layout.tsx
import { Inter, Geist_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export default function RootLayout() {
  return (
    <html lang="en" className={`${inter.className} ${geistMono.variable}`}>
      <body>{/* ... */}</body>
    </html>
  )
}
```

---

## Compression

Enable compression in `next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
}

export default config
```

---

## Performance Monitoring

Add performance metrics:

```typescript
// src/lib/metrics.ts
export function reportWebVitals(metric: any) {
  if (metric.label === 'web-vital') {
    console.log(`${metric.name}:`, metric.value)

    // Send to analytics
    if (process.env.NEXT_PUBLIC_ANALYTICS_ID) {
      fetch('/api/metrics', {
        method: 'POST',
        body: JSON.stringify(metric),
      }).catch(() => {})
    }
  }
}
```

Use in `next.config.ts`:

```typescript
const config: NextConfig = {
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}
```

---

## Best Practices

1. **Use Image component**: Optimize images with Next.js Image
2. **Lazy load**: Use dynamic imports for non-critical code
3. **Tree shake**: Import only what you need
4. **Cache**: Use appropriate caching strategies
5. **Minimize re-renders**: Use React.memo, useCallback
6. **Analyze bundle**: Monitor bundle size
7. **Streaming**: Use Suspense for better UX
8. **Compression**: Enable compression in config

---

## Performance Optimization Strategies

Optimizing application performance involves these key areas:

- All images use Next.js `Image` component for automatic optimization, lazy loading, and responsive sizing
- Heavy components and routes should be lazy loaded with `dynamic()` to reduce initial bundle size
- `Suspense` boundaries wrap async components to show loading states gracefully
- Fetch requests use appropriate cache strategies (no-store, revalidate, force-cache) based on data freshness needs
- Components avoid unnecessary re-renders by properly memoizing expensive calculations and managing state locally
- Bundle size is regularly analyzed using build tools to identify and reduce bloat
- Fonts are optimized with font subsetting and served via `next/font` for better performance
- Gzip and Brotli compression are enabled on the server to reduce payload sizes
