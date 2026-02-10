import { ChevronDown } from 'lucide-react';
import { type SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/shadcnPopover';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../Field';
import { Skeleton } from '../../Skeleton';
import type { Option, SingleInputProps } from '../types';
import { ComboboxList } from './ComboboxList';
import { MenuFooter } from './MenuFooter';
import { OptionsLoader } from './OptionsLoader';

/**
 * Debounce utility function
 */
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * SingleInput - Form field variant of SingleSelect
 *
 * Traditional form field appearance with label, error states, and helper text.
 * Uses the Field system for consistent form styling.
 *
 * @internal This component is for internal use within SingleSelect
 */
export const SingleInput = ({
  optionsApiEndPoint,
  required = false,
  label,
  name,
  getValue,
  value,
  placeholder = 'Select an option...',
  onChange,
  error,
  helperText,
  searchDb,
  handleOpen,
  handleClose,
  handleScroll,
  state,
  disableClear = false,
  fullWidth = false,
  disabled = false,
  loading = false,
}: SingleInputProps) => {
  const { open, loadingInitialInternalOptions, internalOptions, loadingInternalOptions, internalOptionsMap } = state;

  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [searchValue, setSearchValue] = useState('');

  // Force re-render on mount to ensure Popover positioning works
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, []);

  // Debounced search for API mode
  const debouncedSearchDb = useMemo(() => {
    return debounce((searchVal: string) => {
      if (optionsApiEndPoint) {
        searchDb(searchVal);
      }
    }, 300);
  }, [searchDb, optionsApiEndPoint]);

  // Handle search input changes
  const handleSearchChange = useCallback(
    (searchVal: string) => {
      setSearchValue(searchVal);
      debouncedSearchDb(searchVal);
    },
    [debouncedSearchDb],
  );

  // Get the currently selected option from the map
  const selectedOption = useMemo(() => {
    if (value === null || value === undefined) return null;
    const key = String(value);
    return internalOptionsMap[key] || null;
  }, [value, internalOptionsMap]);

  // Handle option selection
  const handleSelect = useCallback(
    (option: Option) => {
      const newValue = getValue ? getValue(option) : option.value;
      onChange(newValue);
      handleClose({ currentTarget: {}, target: {} } as SyntheticEvent, 'selectOption');
    },
    [onChange, getValue, handleClose],
  );

  // Handle clear
  const handleClear = useCallback(() => {
    onChange(null);
    handleClose({ currentTarget: {}, target: {} } as SyntheticEvent, 'clear');
  }, [onChange, handleClose]);

  // Handle escape key
  const handleEscape = useCallback(() => {
    handleClose({ currentTarget: {}, target: {} } as SyntheticEvent, 'escape');
  }, [handleClose]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open]);

  // Get error message string
  const errorMessage = useMemo(() => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && 'message' in error) return error.message;
    return null;
  }, [error]);

  // Loading state - show skeleton
  if (loadingInitialInternalOptions || loading) {
    return (
      <Field className={fullWidth ? 'w-full' : ''}>
        {label && (
          <FieldLabel>
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </FieldLabel>
        )}
        <Skeleton className="h-9 w-full" />
        {helperText && <FieldDescription>{helperText}</FieldDescription>}
      </Field>
    );
  }

  return (
    <Field className={fullWidth ? 'w-full' : ''}>
      {label && (
        <FieldLabel htmlFor={name}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </FieldLabel>
      )}

      <Popover
        open={open && !disabled}
        onOpenChange={(isOpen) => {
          if (disabled) return;

          const syntheticEvent = {
            currentTarget: {},
            target: {},
          } as SyntheticEvent;

          if (isOpen) {
            handleOpen(syntheticEvent);
          } else {
            handleClose(syntheticEvent, 'blur');
          }
        }}
      >
        <PopoverTrigger asChild disabled={disabled}>
          <span ref={wrapperRef} style={{ display: fullWidth ? 'block' : 'inline-block' }}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-invalid={!!error}
              aria-haspopup="listbox"
              disabled={disabled}
              className={cn(
                'justify-between font-normal',
                fullWidth ? 'w-full' : 'w-auto',
                !selectedOption && 'text-muted-foreground',
                error && 'border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
              )}
            >
              {selectedOption?.label || placeholder}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </span>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <ComboboxList
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            options={internalOptions}
            selectedValue={value}
            onSelect={handleSelect}
            onScroll={handleScroll}
            loading={loadingInternalOptions}
            shouldFilter={!optionsApiEndPoint}
            getValue={getValue}
            onEscape={handleEscape}
          />

          {loadingInternalOptions ? (
            <OptionsLoader isSearch={!!state.search} />
          ) : (
            !disableClear && selectedOption && <MenuFooter onClick={handleClear} />
          )}
        </PopoverContent>
      </Popover>

      {helperText && !errorMessage && <FieldDescription>{helperText}</FieldDescription>}
      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
};

SingleInput.displayName = 'SingleInput';
