import { ChevronDownIcon, Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
import {
  MultiSelectActions,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectGroupLabel,
  MultiSelectList,
  MultiSelectRoot,
  MultiSelectRow,
  MultiSelectSearch,
} from '../../../../../shadcn/shadcnMultiSelect';
import { PopoverTrigger } from '../../../../../shadcn/shadcnPopover';
import { cn } from '../../../../../shadcn/utils';
import { useMultiSelect } from '../../hooks/useMultiSelect';
import type { AsyncSelectState, SelectGroup, SelectOption, SelectValue } from '../../types';

export interface MultiSelectFilterProps {
  label?: string;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  value?: SelectValue[];
  onChange?: (values: SelectValue[]) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  defaultValue?: SelectValue[];
  searchPlaceholder?: string;
  asyncState?: AsyncSelectState;
}

// Compact multi-select filter trigger with count-based label display
export const MultiSelectFilter = forwardRef<HTMLButtonElement, MultiSelectFilterProps>(
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
    const state = useMultiSelect({
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
        <MultiSelectRow
          key={String(option.value)}
          name={option.label}
          checked={state.selectedSet.has(option.value)}
          onToggle={() => {
            state.toggleOption(option.value);
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
        return <MultiSelectEmpty />;
      }

      if (!state.grouped) {
        return state.filteredOptions.map(renderRow);
      }

      return (
        <>
          {state.grouped.ungrouped.map(renderRow)}
          {state.grouped.entries.map((entry) => (
            <MultiSelectGroup key={entry.name}>
              <MultiSelectGroupLabel>{entry.name}</MultiSelectGroupLabel>
              {entry.options.map(renderRow)}
            </MultiSelectGroup>
          ))}
        </>
      );
    }

    const hasValues = state.selectedValues.length > 0;

    const triggerText = hasValues ? `${label} = ${state.selectedValues.length} selected` : (label ?? placeholder);

    return (
      <>
        <MultiSelectRoot open={state.open} onOpenChange={state.setOpen} disabled={disabled}>
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
                hasValues
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
                className,
              )}
            >
              <span className="truncate">{triggerText}</span>
              <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>

          <MultiSelectContent className="w-[250px]">
            <MultiSelectSearch value={searchValue} onValueChange={setSearchValue} placeholder={searchPlaceholder} />

            <MultiSelectList id={state.listboxId}>
              {renderOptions()}
              {asyncState?.hasMore && <div ref={asyncState.sentinelRef} className="h-1" />}
              {asyncState?.loadingMore && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Loading more...</span>
                </div>
              )}
            </MultiSelectList>

            <MultiSelectActions onSelectAll={state.selectAll} onClear={state.clearAll} disabled={disabled} />
          </MultiSelectContent>
        </MultiSelectRoot>

        {name && state.selectedValues.map((v) => <input key={String(v)} type="hidden" name={name} value={String(v)} />)}
      </>
    );
  },
);

MultiSelectFilter.displayName = 'MultiSelectFilter';
