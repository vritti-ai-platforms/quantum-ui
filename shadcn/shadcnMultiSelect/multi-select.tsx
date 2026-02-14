'use client';

import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import * as React from 'react';

import { Checkbox } from '../shadcnCheckbox';
import { Popover, PopoverContent, PopoverTrigger } from '../shadcnPopover';
import { cn } from '../utils';

// MultiSelectRoot — wraps Radix Popover to provide open/close state
interface MultiSelectRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

function MultiSelectRoot({ open, onOpenChange, disabled, children }: MultiSelectRootProps) {
  return (
    <Popover data-slot="multi-select" open={disabled ? false : open} onOpenChange={disabled ? undefined : onOpenChange}>
      {children}
    </Popover>
  );
}

// MultiSelectTrigger — styled trigger button that mirrors SelectTrigger
interface MultiSelectTriggerProps extends React.ComponentProps<'button'> {
  className?: string;
  open?: boolean;
  listboxId?: string;
}

const MultiSelectTrigger = React.forwardRef<HTMLButtonElement, MultiSelectTriggerProps>(
  ({ className, children, disabled, open, listboxId, ...props }, ref) => {
    return (
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          data-slot="multi-select-trigger"
          role="combobox"
          aria-expanded={open ?? false}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          disabled={disabled}
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            'min-h-9',
            className,
          )}
          {...props}
        >
          {children}
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
    );
  },
);

MultiSelectTrigger.displayName = 'MultiSelectTrigger';

// MultiSelectContent — styled dropdown panel wrapping PopoverContent
interface MultiSelectContentProps extends React.ComponentProps<typeof PopoverContent> {
  className?: string;
}

function MultiSelectContent({ className, children, align = 'start', ...props }: MultiSelectContentProps) {
  return (
    <PopoverContent
      data-slot="multi-select-content"
      align={align}
      className={cn('w-[var(--radix-popover-trigger-width)] p-0', className)}
      {...props}
    >
      {children}
    </PopoverContent>
  );
}

// MultiSelectSearch — search input for filtering options (stateless)
interface MultiSelectSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function MultiSelectSearch({ value, onValueChange, placeholder = 'Search...', className }: MultiSelectSearchProps) {
  return (
    <div data-slot="multi-select-search" className={cn('flex items-center gap-2 border-b px-3', className)}>
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="text"
        aria-label="Search options"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

// MultiSelectActions — Select All / Clear action bar
interface MultiSelectActionsProps {
  onSelectAll: () => void;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
}

function MultiSelectActions({ onSelectAll, onClear, disabled, className }: MultiSelectActionsProps) {
  return (
    <div
      data-slot="multi-select-actions"
      className={cn('flex items-center justify-between border-b px-3 py-1.5', className)}
    >
      <button
        type="button"
        disabled={disabled}
        className="text-xs font-medium text-primary hover:text-primary/80 disabled:pointer-events-none disabled:opacity-50"
        onClick={onSelectAll}
      >
        Select All
      </button>
      <button
        type="button"
        disabled={disabled}
        className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  );
}

// MultiSelectList — scrollable listbox container for option rows
interface MultiSelectListProps extends React.ComponentProps<'div'> {
  className?: string;
}

function MultiSelectList({ className, children, ...props }: MultiSelectListProps) {
  return (
    <div
      data-slot="multi-select-list"
      role="listbox"
      aria-multiselectable="true"
      className={cn('max-h-60 overflow-y-auto p-1', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// MultiSelectRow — a single option row with a checkbox
interface MultiSelectRowProps {
  name: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

const MultiSelectRow = React.memo(function MultiSelectRow({
  name,
  checked,
  onToggle,
  disabled,
  className,
}: MultiSelectRowProps) {
  function handleClick() {
    if (!disabled) {
      onToggle();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }

  return (
    <div
      data-slot="multi-select-row"
      role="option"
      aria-selected={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? undefined : 0}
      className={cn(
        'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none',
        'hover:bg-accent hover:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      data-disabled={disabled ? '' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={() => onToggle()}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
      />
      <span className="truncate">{name}</span>
    </div>
  );
});

// MultiSelectEmpty — displayed when no options match a search filter
interface MultiSelectEmptyProps {
  children?: React.ReactNode;
  className?: string;
}

function MultiSelectEmpty({ children, className }: MultiSelectEmptyProps) {
  return (
    <div
      data-slot="multi-select-empty"
      className={cn('flex items-center justify-center py-6 text-sm text-muted-foreground', className)}
    >
      {children ?? 'No options found.'}
    </div>
  );
}

export {
  MultiSelectActions,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectList,
  MultiSelectRoot,
  MultiSelectRow,
  MultiSelectSearch,
  MultiSelectTrigger,
};

export type {
  MultiSelectActionsProps,
  MultiSelectContentProps,
  MultiSelectEmptyProps,
  MultiSelectListProps,
  MultiSelectRootProps,
  MultiSelectRowProps,
  MultiSelectSearchProps,
  MultiSelectTriggerProps,
};
