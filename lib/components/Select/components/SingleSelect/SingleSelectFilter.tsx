import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';
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
import { PopoverTrigger } from '../../../../../shadcn/shadcnPopover';
import { cn } from '../../../../../shadcn/utils';
import type { SelectGroup, SelectOption } from '../../types';
import { useSingleSelectState } from './useSingleSelectState';

export interface SingleSelectFilterProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  groups?: SelectGroup[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  defaultValue?: string;
  searchPlaceholder?: string;
}

// Compact single-select filter trigger with inline label display
export const SingleSelectFilter = React.forwardRef<HTMLButtonElement, SingleSelectFilterProps>(
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
      selectedValue,
      selectedOption,
      open,
      setOpen,
      searchQuery,
      setSearchQuery,
      listboxId,
      filteredOptions,
      grouped,
      selectOption,
      clearSelection,
    } = useSingleSelectState({ options, groups, value: controlledValue, onChange, defaultValue });

    // Renders a single option row
    function renderRow(option: SelectOption) {
      return (
        <SingleSelectRow
          key={option.value}
          name={option.label}
          selected={selectedValue === option.value}
          onSelect={() => selectOption(option.value)}
          disabled={option.disabled}
        />
      );
    }

    // Renders the option list content (flat or grouped)
    function renderOptions() {
      if (filteredOptions.length === 0) {
        return <SingleSelectEmpty />;
      }

      if (!grouped) {
        return filteredOptions.map(renderRow);
      }

      return (
        <>
          {grouped.ungrouped.map(renderRow)}
          {grouped.entries.map((entry) => (
            <SingleSelectGroup key={entry.name}>
              <SingleSelectGroupLabel>{entry.name}</SingleSelectGroupLabel>
              {entry.options.map(renderRow)}
            </SingleSelectGroup>
          ))}
        </>
      );
    }

    const triggerText = selectedOption
      ? `${label} = ${selectedOption.label}`
      : (label ?? placeholder);

    return (
      <>
        <SingleSelectRoot open={open} onOpenChange={setOpen} disabled={disabled}>
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
                selectedOption
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
            <SingleSelectSearch value={searchQuery} onValueChange={setSearchQuery} placeholder={searchPlaceholder} />

            <SingleSelectList id={listboxId}>{renderOptions()}</SingleSelectList>

            <SingleSelectClear onClear={clearSelection} disabled={!selectedValue} />
          </SingleSelectContent>
        </SingleSelectRoot>

        {name && selectedValue && <input type="hidden" name={name} value={selectedValue} />}
      </>
    );
  },
);

SingleSelectFilter.displayName = 'SingleSelectFilter';
