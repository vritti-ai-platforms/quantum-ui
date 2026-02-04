# @vritti/quantum-ui - Development Best Practices

This document outlines the architectural patterns, conventions, and best practices for contributing to the @vritti/quantum-ui component library.

## Project Overview

@vritti/quantum-ui is a modern, TypeScript-first React component library built on:
- **Radix UI** primitives for accessibility
- **Tailwind CSS v4** for styling
- **shadcn/ui** design patterns
- **class-variance-authority (cva)** for variant management

## Directory Structure

```
quantum-ui/
├── lib/                    # Source code (published)
│   ├── components/         # Public component wrappers
│   │   └── ComponentName/
│   │       ├── ComponentName.tsx
│   │       ├── ComponentName.stories.tsx
│   │       └── index.ts
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── index.ts           # Main barrel export
├── shadcn/                # shadcn base components (internal)
│   └── shadcnComponentName/
│       ├── component.tsx
│       └── index.ts
├── dist/                  # Build output
└── vite.config.ts         # Build configuration
```

## Critical Best Practices

### 1. NEVER Export shadcn Components Directly

Always wrap shadcn components with an alias. This ensures:
- Consistent naming across the package
- Ability to add custom logic later without breaking changes
- Proper tree-shaking

```typescript
// WRONG - Direct re-export breaks bundling
export { Skeleton } from '../../../shadcn/shadcnSkeleton';

// CORRECT - Import with alias, then export
import { Skeleton as ShadcnSkeleton } from '../../../shadcn/shadcnSkeleton';
export const Skeleton = ShadcnSkeleton;
```

### 2. Component File Structure

Each component should have its own directory under `lib/components/`:

```
lib/components/MyComponent/
├── MyComponent.tsx          # Component implementation
├── MyComponent.stories.tsx  # Storybook stories (optional)
└── index.ts                 # Barrel export
```

**MyComponent.tsx:**
```typescript
import { ShadcnComponent as BaseShadcnComponent } from '../../../shadcn/shadcnComponent';

// If wrapping shadcn
export const MyComponent = BaseShadcnComponent;

// If custom component
export interface MyComponentProps {
  // Props interface with JSDoc
}

export const MyComponent: React.FC<MyComponentProps> = (props) => {
  // Implementation
};
```

**index.ts:**
```typescript
export { MyComponent } from './MyComponent';
// Export types if defined
export type { MyComponentProps } from './MyComponent';
```

### 3. Export Registration Checklist

When adding a new component, update these files:

1. **`lib/components/index.ts`** - Add barrel export:
   ```typescript
   export * from './MyComponent';
   ```

2. **`package.json`** - Add to exports field:
   ```json
   "./MyComponent": {
     "types": "./dist/lib/components/MyComponent/index.d.ts",
     "import": "./dist/components/MyComponent.js"
   }
   ```

3. **`vite.config.ts`** - Add entry point:
   ```typescript
   'components/MyComponent': resolve(__dirname, 'lib/components/MyComponent/index.ts'),
   ```

### 4. TypeScript Conventions

- Export prop interfaces alongside components
- Use JSDoc comments for public APIs
- Prefer `interface` over `type` for props
- Use React.FC sparingly (prefer explicit return types)
- Always export types that consumers might need

```typescript
/**
 * Props for the MyComponent
 */
export interface MyComponentProps {
  /** Size variant of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * MyComponent renders a...
 *
 * @example
 * ```tsx
 * <MyComponent size="lg" />
 * ```
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  size = 'md',
  className,
}) => {
  // Implementation
};

MyComponent.displayName = 'MyComponent';
```

### 5. Styling Guidelines

- Use Tailwind CSS v4 utility classes
- Import `cn` utility from `../../../shadcn/utils` for class merging
- Follow the design token system (see `lib/index.css`)
- Support dark mode via `.dark` class variants
- **NEVER hardcode color values** (hex, rgb, hsl, oklch) - always use design system tokens

```typescript
import { cn } from '../../../shadcn/utils';

<div className={cn(
  'bg-background text-foreground',
  'rounded-md border border-border',
  className
)} />
```

### 6. Color Usage Guidelines

**CRITICAL: Never hardcode colors.** Always use design system tokens from `lib/index.css`.

Available semantic colors:
- `primary` / `primary-foreground` - Brand primary color
- `secondary` / `secondary-foreground` - Secondary actions
- `muted` / `muted-foreground` - Subtle backgrounds/text
- `accent` / `accent-foreground` - Accent highlights
- `destructive` / `destructive-foreground` - Error/danger states
- `warning` / `warning-foreground` - Warning states
- `success` / `success-foreground` - Success states
- `background` / `foreground` - Base colors
- `card` / `card-foreground` - Card surfaces
- `border`, `input`, `ring` - UI element colors

```typescript
// WRONG - Hardcoded colors
<div style={{ color: '#16a34a' }} />
<div className="text-green-600" />  // Tailwind palette colors may not match theme

// CORRECT - Design system tokens
<div className="text-success" />
<div className="bg-success/15 text-success" />
<CheckCircle className="text-success" />
```

For opacity variants, use Tailwind's opacity modifier:
```typescript
<div className="bg-success/15" />  // 15% opacity
<div className="bg-destructive/20" />  // 20% opacity
```

### 6. shadcn Component Integration

The `shadcn/` directory contains base implementations following shadcn/ui patterns:

- Each component lives in `shadcn/shadcnComponentName/`
- Uses Radix UI primitives where applicable
- Implements cva for variant management
- Follows shadcn naming conventions

When wrapping, prefer the simple alias pattern unless you need to:
- Add default props
- Extend functionality
- Compose multiple components

## Build Commands

**Note:** This project uses **pnpm** as the package manager.

```bash
# Development
pnpm dev

# Build library
pnpm build

# Run Storybook
pnpm storybook

# Code Quality (Biome)
pnpm check    # Check and auto-fix issues
pnpm format   # Format code
pnpm lint     # Lint code
```

## Common Patterns

### Wrapping shadcn Components (Simple)

```typescript
// lib/components/Progress/Progress.tsx
import { Progress as ShadcnProgress } from '../../../shadcn/shadcnProgress/Progress';

export const Progress = ShadcnProgress;
```

### Custom Component with Variants

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../shadcn/utils';

const myComponentVariants = cva(
  'base-classes here',
  {
    variants: {
      variant: {
        default: 'variant-default-classes',
        outline: 'variant-outline-classes',
      },
      size: {
        sm: 'size-sm-classes',
        md: 'size-md-classes',
        lg: 'size-lg-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface MyComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof myComponentVariants> {}

export const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(myComponentVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

MyComponent.displayName = 'MyComponent';
```

## Troubleshooting

### Build Errors

1. **Type errors**: Ensure all types are exported in index.ts
2. **Module not found**: Check vite.config.ts entry points
3. **Export errors**: Verify package.json exports field

### Common Mistakes

- Forgetting to update all three config locations when adding components
- Direct re-exports instead of alias imports
- Missing displayName on components
- Not exporting types alongside components

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS v4](https://tailwindcss.com)
- [class-variance-authority](https://cva.style/docs)
