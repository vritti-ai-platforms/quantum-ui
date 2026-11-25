import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '../utils';

// The tones that can be drawn solid, soft or outlined, with the classes each appearance takes for them
const TONES = {
  destructive: {
    solid: 'bg-destructive text-destructive-foreground dark:bg-destructive/60',
    soft: 'bg-destructive/15 text-destructive-ink dark:bg-destructive/15',
    outline: 'border-destructive/45 text-destructive-ink dark:bg-transparent',
  },
  success: {
    solid: 'bg-success text-success-foreground',
    soft: 'bg-success/15 text-success-ink',
    outline: 'border-success/50 text-success-ink',
  },
  warning: {
    solid: 'bg-warning text-warning-foreground',
    soft: 'bg-warning/15 text-warning-ink',
    outline: 'border-warning/60 text-warning-ink',
  },
  info: {
    solid: 'bg-info text-info-foreground',
    soft: 'bg-info/15 text-info-ink',
    outline: 'border-info/55 text-info-ink',
  },
  excess: {
    solid: 'bg-group-violet text-excess-foreground dark:bg-group-violet/70',
    soft: 'bg-group-violet/15 text-excess-ink',
    outline: 'border-group-violet/45 text-excess-ink',
  },
  notice: {
    solid: 'bg-notice text-notice-foreground',
    soft: 'bg-notice/15 text-notice-ink',
    outline: 'border-notice/45 text-notice-ink dark:border-notice-ink/45',
  },
} as const;

type Tone = keyof typeof TONES;
type Appearance = keyof (typeof TONES)[Tone];

const appearanceVariants = (Object.keys(TONES) as Tone[]).flatMap((tone) =>
  (Object.keys(TONES[tone]) as Appearance[]).map((appearance) => ({
    variant: tone,
    appearance,
    // An outline drops the fill its variant draws by default
    className: cn(appearance === 'outline' && 'bg-transparent', TONES[tone][appearance]),
  })),
);

const badgeVariants = cva(
  'inline-flex items-center justify-center border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        success:
          'bg-success/15 text-success-ink [a&]:hover:bg-success/25 focus-visible:ring-success/20 dark:focus-visible:ring-success/40',
        warning:
          'bg-warning/15 text-warning-ink [a&]:hover:bg-warning/25 focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40',
        info: 'bg-info/15 text-info-ink [a&]:hover:bg-info/25 focus-visible:ring-info/20 dark:focus-visible:ring-info/40',
        excess:
          'bg-group-violet/15 text-excess-ink [a&]:hover:bg-group-violet/25 focus-visible:ring-group-violet/20 dark:focus-visible:ring-group-violet/40',
        notice: 'bg-notice text-notice-foreground [a&]:hover:bg-notice/90 focus-visible:ring-notice/20',
        outline: 'border-foreground/25 text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline cursor-pointer',
      },
      // A pill, or a rounded rectangle for statuses
      shape: {
        pill: 'rounded-full',
        rounded: 'rounded-md',
      },
      // Solid, a soft tint or an outline in the variant's tone; left out, each variant keeps its own fill
      appearance: {
        solid: '',
        soft: '',
        outline: '',
      },
    },
    compoundVariants: appearanceVariants,
    defaultVariants: {
      variant: 'default',
      shape: 'pill',
    },
  },
);

export interface BadgeProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  // A leading dot in the text colour, for a status
  dot?: boolean;
}

function Badge({
  className,
  variant = 'default',
  shape,
  appearance,
  dot = false,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, shape, appearance }), className)}
      {...props}
    >
      {dot && !asChild && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants };
