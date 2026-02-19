import { Loader2, X } from 'lucide-react';
import * as React from 'react';
import { Badge } from '../../../../../shadcn/shadcnBadge';
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
  MultiSelectTrigger,
} from '../../../../../shadcn/shadcnMultiSelect';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../../Field';
import { useMultiSelect } from '../../hooks/useMultiSelect';
import type { AsyncSelectState, SelectGroup, SelectOption, SelectValue } from '../../types';

export interface MultiSelectProps {
  label?: string;
  description?: React.ReactNode;
  error?: string;
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
  maxDisplayedItems?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  asyncState?: AsyncSelectState;
}

// Multi-value select with checkbox options, search, and badge chips
export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      label,
      description,
      error,
      placeholder = 'Select options',
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
      maxDisplayedItems = 3,
      searchable = false,
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

    // Resolve search binding -- async delegates to parent, static uses local state
    const searchValue = asyncState ? asyncState.searchQuery : state.searchQuery;
    const setSearchValue = asyncState ? asyncState.setSearchQuery : state.setSearchQuery;
    const showSearch = !!asyncState || searchable;

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

    // Renders badge chips, count summary, or placeholder inside the trigger
    function renderTriggerContent() {
      if (state.selectedOptions.length === 0) {
        return <span className="text-muted-foreground">{placeholder}</span>;
      }

      if (state.selectedOptions.length > maxDisplayedItems) {
        return <span className="text-sm">{state.selectedOptions.length} items selected</span>;
      }

      return (
        <span className="flex flex-wrap items-center gap-1">
          {state.selectedOptions.map((option) => (
            <Badge key={String(option.value)} variant="secondary" className="gap-1 pr-1">
              {option.label}
              <button
                type="button"
                aria-label={`Remove ${option.label}`}
                className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  state.toggleOption(option.value);
                }}
              >
                <X className="size-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </span>
      );
    }

    return (
      <Field>
        {label && <FieldLabel>{label}</FieldLabel>}

        <MultiSelectRoot open={state.open} onOpenChange={state.setOpen} disabled={disabled}>
          <MultiSelectTrigger
            ref={ref}
            id={id}
            open={state.open}
            listboxId={state.listboxId}
            aria-invalid={!!error}
            aria-required={required}
            disabled={disabled}
            onBlur={onBlur}
            className={className}
          >
            <span className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">{renderTriggerContent()}</span>
          </MultiSelectTrigger>

          <MultiSelectContent>
            {showSearch && (
              <MultiSelectSearch value={searchValue} onValueChange={setSearchValue} placeholder={searchPlaceholder} />
            )}

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

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

MultiSelect.displayName = 'MultiSelect';
