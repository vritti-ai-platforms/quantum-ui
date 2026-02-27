'use client';

import { CheckIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import type React from 'react';
import { forwardRef, memo } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '../shadcnPopover';
import { cn } from '../utils';

// SingleSelectRoot — wraps Radix Popover to provide open/close state
interface SingleSelectRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

function SingleSelectRoot({ open, onOpenChange, disabled, children }: SingleSelectRootProps) {
  return (
    <Popover
      data-slot="single-select"
      open={disabled ? false : open}
      onOpenChange={disabled ? undefined : onOpenChange}
    >
      {children}
    </Popover>
  );
}

// SingleSelectTrigger — styled trigger button that mirrors SelectTrigger
interface SingleSelectTriggerProps extends React.ComponentProps<'button'> {
  className?: string;
  open?: boolean;
  listboxId?: string;
}

const SingleSelectTrigger = forwardRef<HTMLButtonElement, SingleSelectTriggerProps>(
  ({ className, children, disabled, open, listboxId, ...props }, ref) => {
    return (
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          data-slot="single-select-trigger"
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

SingleSelectTrigger.displayName = 'SingleSelectTrigger';

// SingleSelectContent — styled dropdown panel wrapping PopoverContent
interface SingleSelectContentProps extends React.ComponentProps<typeof PopoverContent> {
  className?: string;
}

function SingleSelectContent({ className, children, align = 'start', ...props }: SingleSelectContentProps) {
  return (
    <PopoverContent
      data-slot="single-select-content"
      align={align}
      className={cn('w-[var(--radix-popover-trigger-width)] p-0', className)}
      {...props}
    >
      {children}
    </PopoverContent>
  );
}

// SingleSelectSearch — search input for filtering options (stateless)
interface SingleSelectSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function SingleSelectSearch({ value, onValueChange, placeholder = 'Search...', className }: SingleSelectSearchProps) {
  return (
    <div data-slot="single-select-search" className={cn('flex items-center gap-2 border-b px-3', className)}>
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

// SingleSelectClear — "Clear" text button in border-b bar
interface SingleSelectClearProps {
  onClear: () => void;
  disabled?: boolean;
  className?: string;
}

function SingleSelectClear({ onClear, disabled, className }: SingleSelectClearProps) {
  return (
    <div
      data-slot="single-select-clear"
      className={cn('flex items-center justify-end border-t px-3 py-1.5', className)}
    >
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

// SingleSelectList — scrollable listbox container for option rows
interface SingleSelectListProps extends React.ComponentProps<'div'> {
  className?: string;
}

function SingleSelectList({ className, children, ...props }: SingleSelectListProps) {
  return (
    <div
      data-slot="single-select-list"
      role="listbox"
      className={cn('max-h-60 overflow-y-auto p-1', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// SingleSelectRow — a single option row with a check icon
interface SingleSelectRowProps {
  name: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
}

const SingleSelectRow = memo(function SingleSelectRow({
  name,
  description,
  selected,
  onSelect,
  disabled,
  className,
}: SingleSelectRowProps) {
  function handleClick() {
    if (!disabled) {
      onSelect();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  }

  return (
    <div
      data-slot="single-select-row"
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? undefined : 0}
      className={cn(
        'relative flex w-full cursor-default flex-col items-start rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
        'hover:bg-accent hover:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      data-disabled={disabled ? '' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="truncate">{name}</span>
      {description && (
        <span className="truncate text-xs text-muted-foreground mt-0.5">{description}</span>
      )}
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        {selected && <CheckIcon className="size-4" />}
      </span>
    </div>
  );
});

// SingleSelectGroup — wraps a group of rows with a role="group" container
interface SingleSelectGroupProps extends React.ComponentProps<'div'> {
  className?: string;
}

function SingleSelectGroup({ className, children, ...props }: SingleSelectGroupProps) {
  return (
    <div data-slot="single-select-group" role="group" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

// SingleSelectGroupLabel — styled label for a group header
interface SingleSelectGroupLabelProps extends React.ComponentProps<'div'> {
  className?: string;
}

function SingleSelectGroupLabel({ className, children, ...props }: SingleSelectGroupLabelProps) {
  return (
    <div
      data-slot="single-select-group-label"
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// SingleSelectEmpty — displayed when no options match a search filter
interface SingleSelectEmptyProps {
  children?: React.ReactNode;
  className?: string;
}

function SingleSelectEmpty({ children, className }: SingleSelectEmptyProps) {
  return (
    <div
      data-slot="single-select-empty"
      className={cn('flex items-center justify-center py-6 text-sm text-muted-foreground', className)}
    >
      {children ?? 'No options found.'}
    </div>
  );
}

export {
  SingleSelectClear,
  SingleSelectContent,
  SingleSelectEmpty,
  SingleSelectGroup,
  SingleSelectGroupLabel,
  SingleSelectList,
  SingleSelectRoot,
  SingleSelectRow,
  SingleSelectSearch,
  SingleSelectTrigger,
};

export type {
  SingleSelectClearProps,
  SingleSelectContentProps,
  SingleSelectEmptyProps,
  SingleSelectGroupLabelProps,
  SingleSelectGroupProps,
  SingleSelectListProps,
  SingleSelectRootProps,
  SingleSelectRowProps,
  SingleSelectSearchProps,
  SingleSelectTriggerProps,
};
