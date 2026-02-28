import { ChevronDownIcon, Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
import { PopoverTrigger } from '../../../../../shadcn/shadcnPopover';
import {
  SingleSelectClear,
  SingleSelectContent,
  SingleSelectEmpty,
  SingleSelectGroup,
  SingleSelectGroupLabel,
  SingleSelectList,
  SingleSelectRoot,
  SingleSelectRow,
  SingleSelectSearch,
} from '../../../../../shadcn/shadcnSingleSelect';
import { cn } from '../../../../../shadcn/utils';
import { useSingleSelect } from '../../hooks/useSingleSelect';
import type { AsyncSelectState, SelectGroup, SelectOption, SelectValue } from '../../types';

export interface SingleSelectFilterProps {
  label?: string;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  value?: SelectValue;
  onChange?: (value: SelectValue) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  defaultValue?: SelectValue;
  searchPlaceholder?: string;
  asyncState?: AsyncSelectState;
}

// Compact single-select filter trigger with inline label display
export const SingleSelectFilter = forwardRef<HTMLButtonElement, SingleSelectFilterProps>(
  (
    {
      label,
      placeholder,
      options,
      groups,
      value: controlledValue,
      onChange,
      onBlur,
      name,
      disabled = false,
      required,
      className,
      id,
      defaultValue,
      searchPlaceholder = 'Search...',
      asyncState,
    },
    ref,
  ) => {
    const state = useSingleSelect({
      options: options ?? [],
      groups,
      value: controlledValue,
      onChange,
      defaultValue,
      remoteSearch: !!asyncState,
    });

    // Resolve search binding -- async delegates to parent, filter always shows search
    const searchValue = asyncState ? asyncState.searchQuery : state.searchQuery;
    const setSearchValue = asyncState ? asyncState.setSearchQuery : state.setSearchQuery;

    // Renders a single option row
    function renderRow(option: SelectOption) {
      return (
        <SingleSelectRow
          key={String(option.value)}
          name={option.label}
          description={option.description}
          selected={state.selectedValue === option.value}
          onSelect={() => {
            state.selectOption(option.value);
          }}
          disabled={option.disabled}
        />
      );
    }

    // Renders the option list content (flat or grouped)
    function renderOptions() {
      if (asyncState?.loading) {
        return (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        );
      }

      if (state.filteredOptions.length === 0) {
        return <SingleSelectEmpty />;
      }

      if (!state.grouped) {
        return state.filteredOptions.map(renderRow);
      }

      return (
        <>
          {state.grouped.ungrouped.map(renderRow)}
          {state.grouped.entries.map((entry) => (
            <SingleSelectGroup key={entry.name}>
              <SingleSelectGroupLabel>{entry.name}</SingleSelectGroupLabel>
              {entry.options.map(renderRow)}
            </SingleSelectGroup>
          ))}
        </>
      );
    }

    const triggerText = state.selectedOption ? `${label} = ${state.selectedOption.label}` : (label ?? placeholder);

    return (
      <>
        <SingleSelectRoot open={state.open} onOpenChange={state.setOpen} disabled={disabled}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              id={id}
              type="button"
              role="combobox"
              aria-expanded={state.open}
              aria-haspopup="listbox"
              aria-controls={state.listboxId}
              aria-required={required}
              disabled={disabled}
              onBlur={onBlur}
              className={cn(
                'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                state.selectedOption
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
                className,
              )}
            >
              <span className="truncate">{triggerText}</span>
              <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>

          <SingleSelectContent className="w-[250px]">
            <SingleSelectSearch value={searchValue} onValueChange={setSearchValue} placeholder={searchPlaceholder} />

            <SingleSelectList id={state.listboxId}>
              {renderOptions()}
              {asyncState?.hasMore && <div ref={asyncState.sentinelRef} className="h-1" />}
              {asyncState?.loadingMore && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Loading more...</span>
                </div>
              )}
            </SingleSelectList>

            <SingleSelectClear onClear={state.clearSelection} disabled={!state.selectedValue} />
          </SingleSelectContent>
        </SingleSelectRoot>

        {name && state.selectedValue && <input type="hidden" name={name} value={String(state.selectedValue)} />}
      </>
    );
  },
);

SingleSelectFilter.displayName = 'SingleSelectFilter';
