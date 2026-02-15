import { X } from 'lucide-react';
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
import type { SelectGroup, SelectOption } from '../../types';
import { useMultiSelectState } from './useMultiSelectState';

export interface MultiSelectProps {
  label?: string;
  description?: React.ReactNode;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  groups?: SelectGroup[];
  value?: string[];
  onChange?: (values: string[]) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  defaultValue?: string[];
  maxDisplayedItems?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
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
    },
    ref,
  ) => {
    const {
      selectedValues,
      selectedSet,
      selectedOptions,
      open,
      setOpen,
      searchQuery,
      setSearchQuery,
      listboxId,
      filteredOptions,
      grouped,
      toggleOption,
      selectAll,
      clearAll,
    } = useMultiSelectState({ options, groups, value: controlledValue, onChange, defaultValue });

    // Renders a single option row
    function renderRow(option: SelectOption) {
      return (
        <MultiSelectRow
          key={option.value}
          name={option.label}
          checked={selectedSet.has(option.value)}
          onToggle={() => toggleOption(option.value)}
          disabled={option.disabled}
        />
      );
    }

    // Renders the option list content (flat or grouped)
    function renderOptions() {
      if (filteredOptions.length === 0) {
        return <MultiSelectEmpty />;
      }

      if (!grouped) {
        return filteredOptions.map(renderRow);
      }

      return (
        <>
          {grouped.ungrouped.map(renderRow)}
          {grouped.entries.map((entry) => (
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
      if (selectedOptions.length === 0) {
        return <span className="text-muted-foreground">{placeholder}</span>;
      }

      if (selectedOptions.length > maxDisplayedItems) {
        return <span className="text-sm">{selectedOptions.length} items selected</span>;
      }

      return (
        <span className="flex flex-wrap items-center gap-1">
          {selectedOptions.map((option) => (
            <Badge key={option.value} variant="secondary" className="gap-1 pr-1">
              {option.label}
              <button
                type="button"
                aria-label={`Remove ${option.label}`}
                className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(option.value);
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

        <MultiSelectRoot open={open} onOpenChange={setOpen} disabled={disabled}>
          <MultiSelectTrigger
            ref={ref}
            id={id}
            open={open}
            listboxId={listboxId}
            aria-invalid={!!error}
            aria-required={required}
            disabled={disabled}
            onBlur={onBlur}
            className={className}
          >
            <span className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">{renderTriggerContent()}</span>
          </MultiSelectTrigger>

          <MultiSelectContent>
            {searchable && (
              <MultiSelectSearch value={searchQuery} onValueChange={setSearchQuery} placeholder={searchPlaceholder} />
            )}

            <MultiSelectList id={listboxId}>{renderOptions()}</MultiSelectList>

            <MultiSelectActions onSelectAll={selectAll} onClear={clearAll} disabled={disabled} />
          </MultiSelectContent>
        </MultiSelectRoot>

        {name && selectedValues.map((v) => <input key={v} type="hidden" name={name} value={v} />)}

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

MultiSelect.displayName = 'MultiSelect';
