import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';
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
import type { SelectGroup, SelectOption } from '../../types';

export interface MultiSelectFilterProps {
  label?: string;
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
  searchPlaceholder?: string;
}

// Compact multi-select filter trigger with count-based label display
export const MultiSelectFilter = React.forwardRef<HTMLButtonElement, MultiSelectFilterProps>(
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
    },
    ref,
  ) => {
    const {
      selectedValues,
      selectedSet,
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
    } = useMultiSelect({ options, groups, value: controlledValue, onChange, defaultValue });

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

    const hasValues = selectedValues.length > 0;

    const triggerText = hasValues ? `${label} = ${selectedValues.length} selected` : (label ?? placeholder);

    return (
      <>
        <MultiSelectRoot open={open} onOpenChange={setOpen} disabled={disabled}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              id={id}
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls={listboxId}
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
            <MultiSelectSearch value={searchQuery} onValueChange={setSearchQuery} placeholder={searchPlaceholder} />

            <MultiSelectList id={listboxId}>{renderOptions()}</MultiSelectList>

            <MultiSelectActions onSelectAll={selectAll} onClear={clearAll} disabled={disabled} />
          </MultiSelectContent>
        </MultiSelectRoot>

        {name && selectedValues.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      </>
    );
  },
);

MultiSelectFilter.displayName = 'MultiSelectFilter';
