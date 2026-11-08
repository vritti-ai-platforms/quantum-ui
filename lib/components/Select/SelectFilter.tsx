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
  v: FilterResult | SelectValue | SelectValue[] | undefined | null,
): SelectValue | SelectValue[] | undefined {
  if (v == null) return undefined;
  if (isFilterResult(v)) return v.value as SelectValue | SelectValue[];
  return v as SelectValue | SelectValue[];
}

interface SelectFilterBaseProps {
  name: string;
  optionsEndpoint?: string;
  searchDebounceMs?: number;
  limit?: number;
  fieldKeys?: SelectFieldKeys;
  params?: Record<string, string | number | boolean>;
}

interface SelectFilterCommonProps
  extends Omit<SingleSelectFilterProps & MultiSelectFilterProps, 'name' | 'onChange' | 'value' | 'clearable'>,
    SelectFilterBaseProps {}

// A multi-select can always be emptied by unticking every option, so it emits `null` whether or not it is clearable. A
// single select only empties through its clear controls: with `clearable={false}` it always holds a value, so `value`
// is required and `onChange` never receives `null`.
export type SelectFilterProps = SelectFilterCommonProps &
  (
    | {
        multiple: true;
        clearable?: boolean;
        value?: FilterResult | SelectValue[];
        onChange?: (result: FilterResult | null) => void;
      }
    | {
        multiple?: false;
        clearable?: true;
        value?: FilterResult | SelectValue;
        onChange?: (result: FilterResult | null) => void;
      }
    | {
        multiple?: false;
        clearable: false;
        value: FilterResult | SelectValue;
        onChange?: (result: FilterResult) => void;
      }
  );

// Unified filter-variant select that emits FilterResult from onChange — supports Form integration
export const SelectFilter = forwardRef<HTMLButtonElement, SelectFilterProps>((props, ref) => {
  const {
    multiple,
    mode,
    name,
    optionsEndpoint,
    searchDebounceMs,
    limit,
    fieldKeys,
    params,
    value,
    onChange: onChangeProp,
    operator: controlledOperator,
    onOperatorChange,
    onOpenChange,
    ...rest
  } = props;
  // null is only sent when the selection empties, which a non-clearable single select never does
  const onChange = onChangeProp as ((result: FilterResult | null) => void) | undefined;

  // Track operator locally for uncontrolled usage; Form-controlled value takes precedence
  const defaultOperator = multiple ? 'isAnyOf' : 'equals';
  const [localOperator, setLocalOperator] = useState(controlledOperator ?? defaultOperator);
  const [open, setOpen] = useState(false);
  const currentOperator = isFilterResult(value) ? value.operator : (controlledOperator ?? localOperator);

  const rawValue = extractRawValue(value);

  function handleOperatorChange(op: string) {
    setLocalOperator(op);
    onOperatorChange?.(op);
    // A multi-select applies its own operator change together with its selection
    if (multiple) return;
    // Propagate operator change immediately when a value is already selected
    if (rawValue != null && rawValue !== '') {
      onChange?.({ field: name, operator: op, value: rawValue as string | number });
    }
  }

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
    open,
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
    // Wrap multi onChange to emit FilterResult — null when the selection is emptied
    function handleMultiChange(rawValues: SelectValue[], operator: string) {
      if (rawValues.length === 0) {
        onChange?.(null);
        return;
      }
      onChange?.({ field: name, operator, value: rawValues.map(String) });
    }

    return (
      <MultiSelectFilter
        ref={ref}
        {...(sharedProps as Omit<MultiSelectFilterProps, 'onChange' | 'value'>)}
        mode={mode}
        value={value === null ? [] : (rawValue as SelectValue[] | undefined)}
        onChange={handleMultiChange}
      />
    );
  }

  // Wrap single onChange to emit FilterResult — null when the selection is cleared
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
      mode={mode}
      value={value === null ? null : (rawValue as SelectValue | undefined)}
      onChange={handleSingleChange}
    />
  );
}) as React.ForwardRefExoticComponent<SelectFilterProps & React.RefAttributes<HTMLButtonElement>>;

SelectFilter.displayName = 'SelectFilter';
