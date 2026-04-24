import type React from 'react';
import { forwardRef, useState } from 'react';
import { MultiSelectFilter, type MultiSelectFilterProps } from './components/MultiSelect/MultiSelectFilter';
import { SingleSelectFilter, type SingleSelectFilterProps } from './components/SingleSelect/SingleSelectFilter';
import { useSelect } from './hooks/useSelect';
import type { AsyncSelectState, FilterResult, SelectFieldKeys, SelectValue } from './types';

// Checks if a value is a FilterResult object (used to handle Form-controlled value round-trips)
function isFilterResult(v: unknown): v is FilterResult {
  return !!v && typeof v === 'object' && !Array.isArray(v) && 'field' in v && 'operator' in v;
}

// Extracts the raw SelectValue(s) from a FilterResult or passes the value through unchanged
function extractRawValue(
  v: FilterResult | SelectValue | SelectValue[] | undefined,
): SelectValue | SelectValue[] | undefined {
  if (isFilterResult(v)) return v.value as SelectValue | SelectValue[];
  return v as SelectValue | SelectValue[] | undefined;
}

interface SelectFilterBaseProps {
  // Used as both the FilterResult field identifier and Form Controller registration key
  name: string;
  optionsEndpoint?: string;
  searchDebounceMs?: number;
  limit?: number;
  fieldKeys?: SelectFieldKeys;
  params?: Record<string, string | number | boolean>;
}

export interface SelectFilterProps
  extends Omit<SingleSelectFilterProps & MultiSelectFilterProps, 'name' | 'onChange' | 'value'>,
    SelectFilterBaseProps {
  multiple?: boolean;
  value?: FilterResult | SelectValue | SelectValue[];
  onChange?: (result: FilterResult | null | undefined) => void;
}

// Unified filter-variant select that emits FilterResult from onChange — supports Form integration
export const SelectFilter = forwardRef<HTMLButtonElement, SelectFilterProps>((props, ref) => {
  const {
    multiple,
    name,
    optionsEndpoint,
    searchDebounceMs,
    limit,
    fieldKeys,
    params,
    value,
    onChange,
    operator: controlledOperator,
    onOperatorChange,
    onOpenChange,
    ...rest
  } = props;

  // Track operator locally for uncontrolled usage; Form-controlled value takes precedence
  const defaultOperator = multiple ? 'isAnyOf' : 'equals';
  const [localOperator, setLocalOperator] = useState(controlledOperator ?? defaultOperator);
  const [open, setOpen] = useState(false);
  const currentOperator = isFilterResult(value) ? value.operator : (controlledOperator ?? localOperator);

  function handleOperatorChange(op: string) {
    setLocalOperator(op);
    onOperatorChange?.(op);
  }

  const rawValue = extractRawValue(value);

  const selectData = useSelect({
    options: rest.options,
    groups: rest.groups,
    optionsEndpoint,
    searchDebounceMs,
    limit,
    fieldKeys,
    params,
    selectedValues: rawValue != null ? (Array.isArray(rawValue) ? rawValue : [rawValue]) : undefined,
    enabled: open,
  });

  const isAsync = !!optionsEndpoint;

  const asyncState: AsyncSelectState | undefined = isAsync
    ? {
        loading: selectData.loading,
        loadingMore: selectData.loadingMore,
        hasMore: selectData.hasMore,
        searchQuery: selectData.searchQuery,
        setSearchQuery: selectData.setSearchQuery,
        sentinelRef: selectData.sentinelRef,
      }
    : undefined;

  const sharedProps = {
    ...rest,
    options: selectData.options,
    groups: selectData.groups,
    asyncState,
    operator: currentOperator,
    onOperatorChange: handleOperatorChange,
    onOpenChange: (nextOpen: boolean) => {
      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    name,
  };

  if (multiple) {
    // Wrap multi onChange to emit FilterResult — emit undefined when selection is cleared
    function handleMultiChange(rawValues: SelectValue[]) {
      if (rawValues.length === 0) {
        onChange?.(null);
        return;
      }
      onChange?.({ field: name, operator: currentOperator, value: rawValues.map(String) });
    }

    return (
      <MultiSelectFilter
        ref={ref}
        {...(sharedProps as Omit<MultiSelectFilterProps, 'onChange' | 'value'>)}
        value={rawValue as SelectValue[] | undefined}
        onChange={handleMultiChange}
      />
    );
  }

  // Wrap single onChange to emit FilterResult — emit undefined when selection is cleared
  function handleSingleChange(rawVal: SelectValue) {
    if (rawVal === '' || rawVal == null) {
      onChange?.(null);
      return;
    }
    onChange?.({ field: name, operator: currentOperator, value: rawVal as string | number });
  }

  return (
    <SingleSelectFilter
      ref={ref}
      {...(sharedProps as Omit<SingleSelectFilterProps, 'onChange' | 'value'>)}
      value={rawValue as SelectValue | undefined}
      onChange={handleSingleChange}
    />
  );
}) as React.ForwardRefExoticComponent<SelectFilterProps & React.RefAttributes<HTMLButtonElement>>;

SelectFilter.displayName = 'SelectFilter';
