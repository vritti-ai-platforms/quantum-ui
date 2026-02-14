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
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue ?? []);
    const selectedValues = isControlled ? controlledValue : internalValue;
    const selectedSet = React.useMemo(() => new Set(selectedValues), [selectedValues]);

    // Ref to latest selectedValues so toggleOption stays reference-stable
    const selectedValuesRef = React.useRef(selectedValues);
    selectedValuesRef.current = selectedValues;

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
      (nextValues: string[]) => {
        if (!isControlled) {
          setInternalValue(nextValues);
        }
        onChange?.(nextValues);
      },
      [isControlled, onChange],
    );

    const toggleOption = React.useCallback(
      (optionValue: string) => {
        const option = optionMap.get(optionValue);
        if (option?.disabled) return;
        const current = selectedValuesRef.current;
        const nextValues = current.includes(optionValue)
          ? current.filter((v) => v !== optionValue)
          : [...current, optionValue];
        updateSelection(nextValues);
      },
      [optionMap, updateSelection],
    );

    // Preserve already-selected disabled options when selecting all
    const selectAll = React.useCallback(() => {
      const enabledValues = options.filter((o) => !o.disabled).map((o) => o.value);
      const currentDisabledValues = selectedValuesRef.current.filter((v) => optionMap.get(v)?.disabled);
      updateSelection([...new Set([...currentDisabledValues, ...enabledValues])]);
    }, [options, optionMap, updateSelection]);

    // Retain disabled options that are currently selected when clearing
    const clearAll = React.useCallback(() => {
      const currentDisabledValues = selectedValuesRef.current.filter((v) => optionMap.get(v)?.disabled);
      updateSelection(currentDisabledValues);
    }, [optionMap, updateSelection]);

    // Reset search when popover closes
    React.useEffect(() => {
      if (!open) {
        setSearchQuery('');
      }
    }, [open]);

    const selectedOptions = React.useMemo(
      () => selectedValues.map((v) => optionMap.get(v)).filter(Boolean) as SelectOption[],
      [selectedValues, optionMap],
    );

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
    const renderTriggerContent = React.useCallback(() => {
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
                // Prevent mousedown from shifting focus away from the popover trigger
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
    }, [selectedOptions, placeholder, maxDisplayedItems, toggleOption]);

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
