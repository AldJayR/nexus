# 11. Styling

Tailwind CSS with shadcn/ui components and CSS variables for theming.

## Setup

### shadcn/ui Configuration

Your project uses shadcn/ui for pre-built components. The `components.json` file configures component generation:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate"
  },
  "aliases": {
    "@": "./src"
  }
}
```

### Tailwind CSS v4 Setup

Tailwind v4 uses **CSS-driven configuration** instead of config files:

```css
/* postcss.config.mjs */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

Then import Tailwind in your CSS:

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --radius-lg: 0.5rem;
  --radius-md: calc(var(--radius-lg) - 2px);
  --radius-sm: calc(var(--radius-lg) - 4px);
}
```

**Note**: No `tailwind.config.ts` file needed for v4. Configuration is done directly in CSS using `@theme` directive.

### CSS Variables

shadcn/ui uses CSS variables defined in `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --muted: 221.2 63.3% 97.8%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 222.2 47.6% 11.2%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --primary: 222.2 47.6% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.6% 11.2%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.6% 11.2%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --primary: 210 40% 96%;
    --primary-foreground: 222.2 47.6% 11.2%;
    --secondary: 222.2 47.6% 11.2%;
    --secondary-foreground: 210 40% 96%;
    --ring: 212.7 26.8% 83.9%;
    --radius: 0.5rem;
  }
}

## Using shadcn/ui Components

shadcn/ui provides pre-built components in `src/components/ui/`. Always use these instead of building from scratch:

```tsx
// ✓ Good - use shadcn components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

<Button>Click me</Button>
<Input placeholder="Enter text" />
<Card>Card content</Card>

// ✗ Avoid - building components manually
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
  Click me
</button>
```

### Adding New shadcn Components

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
```

Common components:
- `button` - Interactive button
- `input` - Form input field
- `card` - Container card
- `label` - Form label
- `select` - Dropdown select
- `checkbox` - Checkbox input
- `radio-group` - Radio buttons
- `alert` - Alert messages
- `dialog` - Modal dialog
- `dropdown-menu` - Dropdown menu
- `tabs` - Tab navigation
- `tooltip` - Tooltip display

## CSS Variables & Colors

All colors in shadcn use CSS variables, making theming automatic:

```tsx
// ✓ Use CSS variable-based classes
<div className="bg-background text-foreground">
  Background with text
</div>

<button className="bg-primary text-primary-foreground">
  Primary button
</button>

<div className="bg-muted text-muted-foreground">
  Muted section
</div>

<div className="border border-border">
  With border
</div>

// ✗ Avoid hardcoded colors
<div className="bg-blue-500">
  Doesn't respect theme changes
</div>
```

### Available CSS Variables

| Variable             | Usage             | Light       | Dark        |
| -------------------- | ----------------- | ----------- | ----------- |
| `--background`       | Page background   | White       | Very dark   |
| `--foreground`       | Text color        | Dark gray   | Off-white   |
| `--primary`          | Primary accent    | Dark blue   | Light blue  |
| `--secondary`        | Secondary accent  | Light gray  | Dark blue   |
| `--muted`            | Muted backgrounds | Light gray  | Dark gray   |
| `--muted-foreground` | Muted text        | Medium gray | Medium gray |
| `--destructive`      | Dangerous actions | Red         | Dark red    |
| `--border`           | Border color      | Light gray  | Dark gray   |
| `--input`            | Input backgrounds | Light gray  | Dark gray   |
| `--ring`             | Focus ring        | Primary     | Primary     |
| `--accent`           | Accent color      | Dark blue   | Light blue  |

---

---

## Responsive Design

Use Tailwind's responsive prefixes:

```tsx
export function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </div>
  )
}
```

Mobile-first approach:

```tsx
// ✓ Good - base is mobile, then enhance for larger screens
<div className="text-sm md:text-base lg:text-lg">
  Responsive text size
</div>

// ✗ Avoid - doesn't work well with mobile-first
<div className="lg:text-lg md:text-base text-sm">
  Confusing order
</div>
```

---

## Dark Mode

Dark mode is **automatic** with shadcn/ui. CSS variables change based on the `.dark` class:

```tsx
// Enable dark mode in your app
export function RootLayout() {
  return (
    <html lang="en">
      <body>
        {/* Dark mode CSS variables apply automatically */}
        {/* Theme can be controlled via system preference or theme toggle */}
      </body>
    </html>
  )
}
```

All shadcn components automatically adapt to dark mode through CSS variables - no additional work needed!

---

## Spacing System

Use consistent spacing:

```tsx
// Use spacing scale consistently
<div className="space-y-4">      {/* 1rem gap between items */}
  <div className="p-4">...</div>  {/* 1rem padding */}
  <div className="p-4">...</div>
</div>

// Spacing scale
// xs: 0.25rem (4px)
// sm: 0.5rem (8px)
// md: 1rem (16px)
// lg: 1.5rem (24px)
// xl: 2rem (32px)
```

---

## Colors

Always use CSS variable-based color classes:

```tsx
// ✓ Good - uses CSS variables
<div className="bg-primary text-primary-foreground">
  Primary button
</div>

<div className="bg-destructive text-destructive-foreground">
  Dangerous action
</div>

<div className="text-muted-foreground">
  Muted text
</div>

// ✗ Avoid - hardcoded colors that ignore theming
<div className="bg-blue-500 text-white">
  Won't change with theme
</div>
```

### Color Combinations

```tsx
// Primary action
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Button
</button>

// Secondary action
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Secondary Button
</button>

// Destructive action
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
  Delete
</button>

// Muted content
<div className="bg-muted text-muted-foreground">
  Inactive state
</div>

// Card with border
<div className="bg-card border border-border">
  Card content
</div>
```

---

## Component Composition

Build interfaces using shadcn components combined with Tailwind layout classes:

```tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function CreateSprintForm() {
  return (
    <Card className="w-full max-w-md">
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-bold">Create Sprint</h2>
        
        <Input placeholder="Sprint name" />
        
        <div className="flex gap-2">
          <Button className="flex-1">Create</Button>
          <Button variant="outline" className="flex-1">Cancel</Button>
        </div>
      </div>
    </Card>
  )
}
```

### Component Variants

shadcn components have built-in variants:

```tsx
import { Button } from '@/components/ui/button'

// Default variant
<Button>Click me</Button>

// Secondary variant
<Button variant="secondary">Secondary</Button>

// Destructive variant
<Button variant="destructive">Delete</Button>

// Outline variant
<Button variant="outline">Outline</Button>

// Ghost variant (minimal)
<Button variant="ghost">Ghost</Button>

// Link variant (appears as link)
<Button variant="link">Link</Button>

// With size
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

---

## Best Practices

1. **Use shadcn components**: Always use pre-built components from `src/components/ui/`
2. **Use CSS variables**: Apply color classes like `bg-primary`, `text-foreground`
3. **Dark mode automatic**: No extra work needed - it just works
4. **Responsive first**: Use Tailwind's responsive prefixes (sm:, md:, lg:)
5. **Consistent spacing**: Use Tailwind spacing scale (gap-, p-, m-)
6. **Component variants**: Use built-in component variants instead of custom styling
7. **Avoid hardcoding colors**: Never use hardcoded hex or rgb values
8. **Extend when needed**: Use Tailwind's extend for project-specific customizations

---

## Common Patterns

### Card Layout

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Content</p>
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Button Group

```tsx
import { Button } from '@/components/ui/button'

<div className="flex gap-2">
  <Button>Action 1</Button>
  <Button variant="outline">Action 2</Button>
</div>
```

### Flex Layout

```tsx
<div className="flex items-center justify-between gap-4">
  <div>Left</div>
  <div>Right</div>
</div>
```

### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* items */}
</div>
```

### Form Section

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle>Sign In</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" />
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Sign In</Button>
  </CardFooter>
</Card>
```

---

## Styling Best Practices

Proper styling in this project follows these conventions:

- All UI components come from `src/components/ui/` (pre-configured shadcn components)
- Colors must use CSS variable classes like `bg-primary`, `text-foreground`, `text-muted-foreground` rather than hardcoded values
- Never use hex colors, rgb values, or other hardcoded color formats; always use semantic CSS variable classes
- Responsive design uses Tailwind breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`) for mobile, tablet, and desktop layouts
- Dark mode must be tested and verified to work correctly with the CSS variable system
- All spacing uses the Tailwind spacing scale (`p-4`, `m-2`, `gap-6`) for consistency
- Component variants should be applied using existing shadcn patterns rather than creating new ones
- Custom CSS is avoided unless absolutely necessary; composition and Tailwind utilities handle most needs
