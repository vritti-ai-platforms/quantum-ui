import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { SelectGroup, SelectOption } from '../types';

interface UseMultiSelectStateProps {
  options: SelectOption[];
  groups?: SelectGroup[];
  value?: string[];
  onChange?: (values: string[]) => void;
  defaultValue?: string[];
}

// Manages controlled/uncontrolled multi-select state, search filtering, and grouping
export function useMultiSelect({
  options,
  groups,
  value: controlledValue,
  onChange,
  defaultValue,
}: UseMultiSelectStateProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const selectedValues = isControlled ? controlledValue : internalValue;
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  // Ref to latest selectedValues so callbacks stay reference-stable
  const selectedValuesRef = useRef(selectedValues);
  selectedValuesRef.current = selectedValues;

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const listboxId = useId();

  const optionMap = useMemo(() => {
    const map = new Map<string, SelectOption>();
    for (const option of options) {
      map.set(option.value, option);
    }
    return map;
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const lower = searchQuery.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(lower));
  }, [options, searchQuery]);

  const updateSelection = useCallback(
    (nextValues: string[]) => {
      if (!isControlled) {
        setInternalValue(nextValues);
      }
      onChange?.(nextValues);
    },
    [isControlled, onChange],
  );

  // Toggle a single option on or off
  const toggleOption = useCallback(
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
  const selectAll = useCallback(() => {
    const enabledValues = options.filter((o) => !o.disabled).map((o) => o.value);
    const currentDisabledValues = selectedValuesRef.current.filter((v) => optionMap.get(v)?.disabled);
    updateSelection([...new Set([...currentDisabledValues, ...enabledValues])]);
  }, [options, optionMap, updateSelection]);

  // Retain disabled options that are currently selected when clearing
  const clearAll = useCallback(() => {
    const currentDisabledValues = selectedValuesRef.current.filter((v) => optionMap.get(v)?.disabled);
    updateSelection(currentDisabledValues);
  }, [optionMap, updateSelection]);

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  // Map selected values to their option objects for display
  const selectedOptions = useMemo(
    () => selectedValues.map((v) => optionMap.get(v)).filter(Boolean) as SelectOption[],
    [selectedValues, optionMap],
  );

  // O(n + g) grouping — one pass over groups, one pass over options
  const grouped = useMemo(() => {
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
      const bucket = buckets.get(g.id);
      if (!bucket || bucket.length === 0) continue;
      entries.push({ name: g.name, options: bucket });
    }

    return { ungrouped, entries };
  }, [filteredOptions, groups]);

  return {
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
  };
}
