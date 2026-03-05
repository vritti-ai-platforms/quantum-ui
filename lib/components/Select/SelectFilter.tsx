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
function extractRawValue(v: FilterResult | SelectValue | SelectValue[] | undefined): SelectValue | SelectValue[] | undefined {
  if (isFilterResult(v)) return v.value as SelectValue | SelectValue[];
  return v as SelectValue | SelectValue[] | undefined;
}

interface SelectFilterBaseProps {
  // The field identifier included in every FilterResult emitted by onChange
  field: string;
  // Used by Form's Controller for registration — Form removes it before passing to the component
  name?: string;
  optionsEndpoint?: string;
  searchDebounceMs?: number;
  limit?: number;
  fieldKeys?: SelectFieldKeys;
  params?: Record<string, string | number | boolean>;
}

interface SelectFilterSingleProps
  extends Omit<SingleSelectFilterProps, 'name' | 'onChange' | 'value'>,
    SelectFilterBaseProps {
  multiple?: false;
  // Accepts a FilterResult (when controlled by Form) or a plain SelectValue (standalone)
  value?: FilterResult | SelectValue;
  onChange?: (result: FilterResult) => void;
}

interface SelectFilterMultiProps
  extends Omit<MultiSelectFilterProps, 'name' | 'onChange' | 'value'>,
    SelectFilterBaseProps {
  multiple: true;
  // Accepts a FilterResult (when controlled by Form) or a plain SelectValue[] (standalone)
  value?: FilterResult | SelectValue[];
  onChange?: (result: FilterResult) => void;
}

export type SelectFilterProps = SelectFilterSingleProps | SelectFilterMultiProps;

// Unified filter-variant select that emits FilterResult from onChange — supports Form integration
export const SelectFilter = forwardRef<HTMLButtonElement, SelectFilterProps>((props, ref) => {
  const {
    multiple,
    field,
    name: _name, // consumed by Form for Controller registration — not forwarded
    optionsEndpoint,
    searchDebounceMs,
    limit,
    fieldKeys,
    params,
    value,
    onChange,
    operator: controlledOperator,
    onOperatorChange,
    ...rest
  } = props;

  // Track operator locally for uncontrolled usage; Form-controlled value takes precedence
  const defaultOperator = multiple ? 'isAnyOf' : 'equals';
  const [localOperator, setLocalOperator] = useState(controlledOperator ?? defaultOperator);
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
    // field is always used as name so inner components always have a valid name
    name: field,
  };

  if (multiple) {
    // Wrap multi onChange to emit FilterResult
    function handleMultiChange(rawValues: SelectValue[]) {
      onChange?.({ field, operator: currentOperator, value: rawValues.map(String) });
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

  // Wrap single onChange to emit FilterResult
  function handleSingleChange(rawVal: SelectValue) {
    onChange?.({ field, operator: currentOperator, value: rawVal as string | number });
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
