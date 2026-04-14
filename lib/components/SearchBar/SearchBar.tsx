import { Loader2, Search, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../../shadcn/utils';
import { TextField } from '../TextField';

export interface SearchBarProps extends Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  focusHotkey?: '/' | false;
  inputClassName?: string;
  unstyled?: boolean;
}

// Reusable search input with controlled/uncontrolled support and debounced callback.
export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      defaultValue = '',
      onChange,
      onDebouncedChange,
      debounceMs = 300,
      loading = false,
      clearable = true,
      onClear,
      focusHotkey = false,
      className,
      inputClassName,
      onKeyDown,
      disabled,
      placeholder = 'Search...',
      unstyled = false,
      ...props
    },
    forwardedRef,
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const mountedRef = useRef(false);

    const currentValue = isControlled ? value : internalValue;

    useEffect(() => {
      if (!onDebouncedChange) return;
      if (!mountedRef.current) {
        mountedRef.current = true;
        return;
      }

      const timeout = setTimeout(() => {
        onDebouncedChange(currentValue ?? '');
      }, debounceMs);

      return () => clearTimeout(timeout);
    }, [currentValue, debounceMs, onDebouncedChange]);

    useEffect(() => {
      if (!focusHotkey) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== focusHotkey) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;

        const target = event.target as HTMLElement | null;
        if (target?.closest('input, textarea, [contenteditable="true"]')) return;

        event.preventDefault();
        inputRef.current?.focus();
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusHotkey]);

    const setRefs = useMemo(
      () => (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    const emitChange = (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    };

    const handleClear = () => {
      emitChange('');
      onClear?.();
      inputRef.current?.focus();
    };

    return (
      <div className={cn('w-full', disabled && 'pointer-events-none opacity-50', className)}>
        <TextField
          {...props}
          ref={setRefs}
          type="search"
          disabled={disabled}
          value={currentValue ?? ''}
          onChange={(event) => emitChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && (currentValue ?? '').length > 0) {
              event.preventDefault();
              handleClear();
              return;
            }
            onKeyDown?.(event);
          }}
          placeholder={placeholder}
          className={cn(
            'bg-background',
            '[&::-webkit-search-cancel-button]:appearance-none',
            '[&::-webkit-search-decoration]:appearance-none',
            '[&::-webkit-search-results-button]:appearance-none',
            '[&::-webkit-search-results-decoration]:appearance-none',
            !unstyled && 'h-9',
            unstyled &&
              'h-full border-0 shadow-none focus-visible:ring-0 focus-visible:border-transparent rounded-none bg-transparent',
            inputClassName,
          )}
          startAdornment={<Search className="size-4 text-muted-foreground" />}
          endAdornment={
            loading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              clearable &&
              (currentValue ?? '').length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center justify-center rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )
            )
          }
        />
      </div>
    );
  },
);

SearchBar.displayName = 'SearchBar';
