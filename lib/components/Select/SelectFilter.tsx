import type React from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';
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
  /** Told whether this control is still settling its value — picking its first option, or checking that its held value
   * still exists; a context bar binds it, and holds its view's data until every control has settled */
  onSettlingChange?: (settling: boolean) => void;
}

interface SelectFilterCommonProps
  extends Omit<SingleSelectFilterProps & MultiSelectFilterProps, 'name' | 'onChange' | 'value' | 'clearable'>,
    SelectFilterBaseProps {}

// A multi-select can always be emptied by unticking every option, so it emits `null` whether or not it is clearable. A
// single select only empties through its clear controls: with `clearable={false}` it always holds a value, so `value`
// is required and `onChange` never receives `null` — unless `selectFirst` supplies that value from the first option.
export type SelectFilterProps = SelectFilterCommonProps &
  (
    | {
        multiple: true;
        clearable?: boolean;
        selectFirst?: never;
        value?: FilterResult | SelectValue[];
        onChange?: (result: FilterResult | null) => void;
      }
    | {
        multiple?: false;
        clearable?: true;
        selectFirst?: boolean;
        value?: FilterResult | SelectValue;
        onChange?: (result: FilterResult | null) => void;
      }
    | {
        multiple?: false;
        clearable: false;
        selectFirst?: false;
        value: FilterResult | SelectValue;
        onChange?: (result: FilterResult) => void;
      }
    | {
        multiple?: false;
        clearable: false;
        selectFirst: true;
        value?: FilterResult | SelectValue;
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
    selectFirst,
    onSettlingChange,
    loading: loadingProp,
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
  // A value still on its way (the `loading` prop) isn't missing, so the first option waits for it
  const needsFirst = !!selectFirst && !multiple && !loadingProp && (rawValue == null || rawValue === '');

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
    enabled: open || needsFirst,
    open,
  });

  // The latest onChange in a ref, so a parent passing a new callback each render doesn't re-pick the first option
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // The value `selectFirst` picks: the first enabled option's — a boolean option can't be a filter value, so none
  const firstOptionValue = selectData.options.find((option) => !option.disabled)?.value;
  const firstValue =
    typeof firstOptionValue === 'string' || typeof firstOptionValue === 'number' ? firstOptionValue : undefined;
  useEffect(() => {
    if (!needsFirst || firstValue === undefined) return;
    onChangeRef.current?.({ field: name, operator: currentOperator, value: firstValue });
  }, [needsFirst, firstValue, name, currentOperator]);

  // A held value the server no longer has (deleted, or no longer offered here) is dropped, so a saved filter or context
  // bar never keeps pointing at something gone — a context default or `selectFirst` then fills the gap
  const { missingValues } = selectData;
  useEffect(() => {
    if (missingValues.length === 0 || rawValue == null) return;
    const gone = new Set(missingValues.map(String));
    if (Array.isArray(rawValue)) {
      const kept = rawValue.map(String).filter((value) => !gone.has(value));
      if (kept.length === rawValue.length) return;
      onChangeRef.current?.(kept.length > 0 ? { field: name, operator: currentOperator, value: kept } : null);
    } else if (gone.has(String(rawValue))) {
      onChangeRef.current?.(null);
    }
  }, [missingValues, rawValue, name, currentOperator]);

  // Still settling its value: picking its first option, checking that its held value still exists, or about to drop one
  // that doesn't. Reported, and cleared when the control goes away mid-way.
  const isPickingFirst = needsFirst && (selectData.loading || firstValue !== undefined);
  const isSettling = isPickingFirst || selectData.checkingValues || missingValues.length > 0;
  const onSettlingChangeRef = useRef(onSettlingChange);
  onSettlingChangeRef.current = onSettlingChange;
  useEffect(() => {
    onSettlingChangeRef.current?.(isSettling);
  }, [isSettling]);
  useEffect(() => () => onSettlingChangeRef.current?.(false), []);

  const isAsync = !!optionsEndpoint;

  // A context selector holds its value's place until it can name it: while told the value is on its way, while the held
  // value's label is read, and while the first option is fetched and picked
  const hasValue = rawValue != null && rawValue !== '' && !(Array.isArray(rawValue) && rawValue.length === 0);
  const isReadingHeldLabel = hasValue && selectData.resolving;
  const loading = !!loadingProp || (mode === 'context' && (isReadingHeldLabel || isPickingFirst));

  const asyncState: AsyncSelectState | undefined = isAsync
    ? {
        loading: selectData.loading,
        loadingMore: selectData.loadingMore,
        hasMore: selectData.hasMore,
        searchQuery: selectData.searchQuery,
        searching: selectData.searching,
        setSearchQuery: selectData.setSearchQuery,
        sentinelRef: selectData.sentinelRef,
      }
    : undefined;

  const sharedProps = {
    ...rest,
    loading,
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
