# 10. Code Quality & Linting

Standards for code quality, formatting, and linting.

## ESLint Configuration

### Install ESLint

```bash
pnpm add -D eslint eslint-config-next
```

### ESLint Config

```json
// .eslintrc.json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "warn",
    "@next/next/no-html-link-for-pages": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-img-element": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": [
      "warn",
      { "allow": ["warn", "error"] }
    ],
    "eqeqeq": ["error", "always"],
    "curly": "error",
    "object-shorthand": "error",
    "quote-props": ["error", "as-needed"]
  }
}
```

---

## Biome Configuration

Alternative to ESLint - faster formatter and linter:

### Install Biome

```bash
pnpm add -D @biomejs/biome
```

### Biome Config

```jsonc
// biome.jsonc
{
  "$schema": "https://biomejs.dev/schemas/1.8.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "useConst": "error",
        "noVar": "error",
        "useTemplate": "error",
        "useWhile": "error"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noRedeclare": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentSize": 2,
    "lineWidth": 100,
    "trailingComma": "es5",
    "semicolons": "always",
    "arrowParentheses": "always"
  }
}
```

---

## Format on Save

### VSCode Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[jsx]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[tsx]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "lint": "biome lint .",
    "lint:fix": "biome lint . --fix",
    "format": "biome format . --write",
    "format:check": "biome format . --check"
  }
}
```

---

## Pre-commit Hooks

### Install husky and lint-staged

```bash
pnpm add -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "pnpm lint-staged"
```

### Configure .lintstagedrc

```json
{
  "*.{ts,tsx,js,jsx}": [
    "biome lint --fix",
    "biome format --write"
  ]
}
```

---

## TypeScript Strict Mode

Ensure `tsconfig.json` has strict mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

---

## Common Issues

### unused-vars

```typescript
// ✗ Don't ignore unused variables
const unused = getValue()

// ✓ Remove if not needed
const value = getValue()
```

### avoid-redundant-else

```typescript
// ✗ Avoid redundant else
if (condition) {
  return value
} else {
  return otherValue
}

// ✓ Simplify
if (condition) {
  return value
}
return otherValue
```

### no-console

```typescript
// ✓ OK in development
console.warn('Warning:', message)
console.error('Error:', error)

// ✗ Avoid in production code
console.log('Debug info')
```

---

## Best Practices

1. **Run linting**: Check before committing
2. **Format code**: Keep consistent formatting
3. **Use strict mode**: Enable TypeScript strict mode
4. **Type everything**: Avoid any types
5. **Comment complex logic**: Add JSDoc comments
6. **Keep components small**: Aim for focused components
7. **Test your code**: Write tests for features
