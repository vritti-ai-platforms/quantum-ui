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
  SingleSelectTrigger,
} from '../../../../../shadcn/shadcnSingleSelect';
import { cn } from '../../../../../shadcn/utils';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../../Field';
import type { SelectGroup, SelectOption } from '../../types';

export interface SingleSelectProps {
  label?: string;
  description?: React.ReactNode;
  error?: string;
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
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
}

// Single-value form field wrapper built on Popover primitives
export const SingleSelect = React.forwardRef<HTMLButtonElement, SingleSelectProps>(
  (
    {
      label,
      description,
      error,
      placeholder = 'Select an option',
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
      searchable = false,
      searchPlaceholder = 'Search...',
      clearable = false,
    },
    ref,
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? '');
    const selectedValue = isControlled ? controlledValue : internalValue;

    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const listboxId = React.useId();

    const optionMap = React.useMemo(() => {
      const map = new Map<string, SelectOption>();
      for (const option of options) {
        map.set(option.value, option);
      }
      return map;
    }, [options]);

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      const lower = searchQuery.toLowerCase();
      return options.filter((option) => option.label.toLowerCase().includes(lower));
    }, [options, searchQuery]);

    const updateSelection = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setInternalValue(nextValue);
        }
        onChange?.(nextValue);
      },
      [isControlled, onChange],
    );

    // Select an option and close the popover
    const selectOption = React.useCallback(
      (optionValue: string) => {
        const option = optionMap.get(optionValue);
        if (option?.disabled) return;
        updateSelection(optionValue);
        setOpen(false);
      },
      [optionMap, updateSelection],
    );

    // Clear the selection and close the popover
    const clearSelection = React.useCallback(() => {
      updateSelection('');
      setOpen(false);
    }, [updateSelection]);

    // Reset search when popover closes
    React.useEffect(() => {
      if (!open) {
        setSearchQuery('');
      }
    }, [open]);

    const selectedOption = selectedValue ? optionMap.get(selectedValue) : undefined;

    // O(n + g) grouping — one pass over groups, one pass over options
    const grouped = React.useMemo(() => {
      if (!groups || groups.length === 0) return null;

      const buckets = new Map<string | number, SelectOption[]>();
      for (const g of groups) {
        buckets.set(g.id, []);
      }

      const ungrouped: SelectOption[] = [];
      for (const option of filteredOptions) {
        const bucket = option.groupId != null ? buckets.get(option.groupId) : undefined;
        if (bucket) {
          bucket.push(option);
        } else {
          ungrouped.push(option);
        }
      }

      const entries: Array<{ name: string; options: SelectOption[] }> = [];
      for (const g of groups) {
        const bucket = buckets.get(g.id)!;
        if (bucket.length > 0) {
          entries.push({ name: g.name, options: bucket });
        }
      }

      return { ungrouped, entries };
    }, [filteredOptions, groups]);

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

    return (
      <Field>
        {label && <FieldLabel>{label}</FieldLabel>}

        <SingleSelectRoot open={open} onOpenChange={setOpen} disabled={disabled}>
          <SingleSelectTrigger
            ref={ref}
            id={id}
            open={open}
            listboxId={listboxId}
            aria-invalid={!!error}
            aria-required={required}
            disabled={disabled}
            onBlur={onBlur}
            className={cn('w-full', className)}
          >
            <span className="flex flex-1 items-center overflow-hidden">
              {selectedOption ? (
                <span className="truncate">{selectedOption.label}</span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
          </SingleSelectTrigger>

          <SingleSelectContent>
            {searchable && (
              <SingleSelectSearch value={searchQuery} onValueChange={setSearchQuery} placeholder={searchPlaceholder} />
            )}

            <SingleSelectList id={listboxId}>{renderOptions()}</SingleSelectList>

            {clearable && <SingleSelectClear onClear={clearSelection} disabled={!selectedValue} />}
          </SingleSelectContent>
        </SingleSelectRoot>

        {name && selectedValue && <input type="hidden" name={name} value={selectedValue} />}

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

SingleSelect.displayName = 'SingleSelect';
