import type React from 'react';
import { cn } from '../../../shadcn/utils';

// How a filter control presents itself: an applied filter chip, or a context selector naming what a table is about
export type FilterMode = 'filter' | 'context';

// A context selector's trigger: quiet and outlined at the toolbar's height, so it reads as the table's frame rather than
// as a filter narrowing it
export const CONTEXT_ANCHOR_CLASS =
  'inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm whitespace-nowrap shadow-xs outline-none transition-[color,box-shadow,border-color] hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:border-ring disabled:cursor-not-allowed disabled:opacity-50';

interface ContextAnchorTextProps {
  label?: string;
  value?: React.ReactNode;
  placeholder?: string;
}

// A context selector's label and value: a small uppercase caption, then the value it holds
export const ContextAnchorText: React.FC<ContextAnchorTextProps> = ({ label, value, placeholder }) => (
  <span className="flex min-w-0 items-baseline gap-2">
    {label && (
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
    )}
    <span className={cn('truncate', value ? 'font-medium text-foreground' : 'text-muted-foreground')}>
      {value ?? placeholder}
    </span>
  </span>
);
