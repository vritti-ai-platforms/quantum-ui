import { Check } from 'lucide-react';
import * as React from 'react';
import { Input } from '../../../../shadcn/shadcnInput';
import { cn } from '../../../../shadcn/utils';
import type { ComboboxListProps, Option } from '../types';

/**
 * ComboboxList - Custom dropdown list component with keyboard navigation
 *
 * Replaces shadcn Command component with a custom implementation that supports:
 * - Searchable input field
 * - Scrollable options list with max-height
 * - Keyboard navigation (Arrow up/down, Enter, Escape)
 * - Icon + two-line option rendering
 * - Check mark for selected item
 * - Infinite scroll support via onScroll handler
 *
 * @internal This component is for internal use within SingleSelect
 */
export const ComboboxList = React.forwardRef<HTMLDivElement, ComboboxListProps>(
  (
    {
      searchValue,
      onSearchChange,
      options,
      selectedValue,
      onSelect,
      onScroll,
      loading = false,
      emptyMessage = 'No options found',
      searchPlaceholder = 'Search...',
      shouldFilter = false,
      getValue,
      onEscape,
    },
    ref,
  ) => {
    const listRef = React.useRef<HTMLFieldSetElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const savedScrollTop = React.useRef<number>(0);
    const previousOptionsLength = React.useRef<number>(options.length);
    const isPaginationScroll = React.useRef<boolean>(false);
    const comboboxId = React.useId();

    // Filter options locally if shouldFilter is true
    const filteredOptions = React.useMemo(() => {
      if (!shouldFilter || !searchValue.trim()) {
        return options;
      }
      const search = searchValue.toLowerCase();
      return options.filter(
        (option) => option.label.toLowerCase().includes(search) || option.subLabel?.toLowerCase().includes(search),
      );
    }, [options, searchValue, shouldFilter]);

    // Get value for comparison
    const getOptionValue = React.useCallback(
      (option: Option): unknown => {
        return getValue ? getValue(option) : option.value;
      },
      [getValue],
    );

    // Check if option is selected
    const isOptionSelected = React.useCallback(
      (option: Option): boolean => {
        const optionValue = getOptionValue(option);
        return optionValue === selectedValue;
      },
      [getOptionValue, selectedValue],
    );

    // Scroll focused item into view
    React.useEffect(() => {
      if (focusedIndex >= 0 && listRef.current) {
        const focusedElement = listRef.current.querySelector(`[data-index="${focusedIndex}"]`);
        if (focusedElement) {
          focusedElement.scrollIntoView({ block: 'nearest' });
        }
      }
    }, [focusedIndex]);

    // Focus input on mount
    React.useEffect(() => {
      // Small delay to ensure popover is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }, []);

    // Restore scroll position when options increase (pagination)
    React.useLayoutEffect(() => {
      const currentLength = options.length;
      const previousLength = previousOptionsLength.current;

      // Check if options increased (pagination) and we have a saved position
      if (isPaginationScroll.current && currentLength > previousLength && listRef.current) {
        // Restore scroll position synchronously before paint
        listRef.current.scrollTop = savedScrollTop.current;

        // Reset flag
        isPaginationScroll.current = false;
      }

      // Update previous length for next comparison
      previousOptionsLength.current = currentLength;
    }, [options.length]);

    // Keyboard navigation handler
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setFocusedIndex((prev) => {
              const nextIndex = prev + 1;
              return nextIndex >= filteredOptions.length ? 0 : nextIndex;
            });
            break;

          case 'ArrowUp':
            e.preventDefault();
            setFocusedIndex((prev) => {
              const nextIndex = prev - 1;
              return nextIndex < 0 ? filteredOptions.length - 1 : nextIndex;
            });
            break;

          case 'Enter':
            e.preventDefault();
            if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
              onSelect(filteredOptions[focusedIndex]);
            }
            break;

          case 'Escape':
            e.preventDefault();
            onEscape?.();
            break;

          case 'Home':
            e.preventDefault();
            setFocusedIndex(0);
            break;

          case 'End':
            e.preventDefault();
            setFocusedIndex(filteredOptions.length - 1);
            break;
        }
      },
      [filteredOptions, focusedIndex, onSelect, onEscape],
    );

    // Scroll handler that saves position before triggering pagination
    const handleScroll = React.useCallback(
      (event: React.UIEvent<HTMLFieldSetElement>) => {
        const currentTarget = event.currentTarget;
        const isNearBottom =
          currentTarget.scrollTop + currentTarget.clientHeight >= currentTarget.scrollHeight - 10;

        // Save scroll position if near bottom (pagination will trigger)
        if (isNearBottom) {
          savedScrollTop.current = currentTarget.scrollTop;
          isPaginationScroll.current = true;
        }

        // Call original onScroll handler (triggers pagination)
        onScroll?.(event);
      },
      [onScroll],
    );

    return (
      <div ref={ref} className="flex flex-col" role="listbox" aria-label="Options">
        {/* Search Input */}
        <div className="border-b p-2">
          <Input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="h-9"
            aria-label="Search options"
            aria-controls={comboboxId}
            autoComplete="off"
          />
        </div>

        {/* Options List */}
        <fieldset
          id={comboboxId}
          ref={listRef}
          onScroll={handleScroll}
          className="max-h-[300px] overflow-y-auto border-0 p-0"
        >
          {filteredOptions.length === 0 && !loading ? (
            <output className="block p-4 text-center text-sm text-muted-foreground">{emptyMessage}</output>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = isOptionSelected(option);
              const isFocused = index === focusedIndex;

              return (
                <div
                  key={String(option.value) ?? index}
                  data-index={index}
                  onClick={() => onSelect(option)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(option);
                    }
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isFocused && 'bg-accent text-accent-foreground',
                    isSelected && 'font-medium',
                  )}
                >
                  {option.icon && <span className="flex shrink-0 items-center">{option.icon}</span>}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{option.label}</div>
                    {option.subLabel && <div className="text-xs text-muted-foreground">{option.subLabel}</div>}
                  </div>
                  <Check className={cn('h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                </div>
              );
            })
          )}
        </fieldset>
      </div>
    );
  },
);

ComboboxList.displayName = 'ComboboxList';
