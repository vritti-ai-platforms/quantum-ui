import type React from 'react';
import { forwardRef, useState } from 'react';
import { MultiSelect, type MultiSelectProps } from './components/MultiSelect/MultiSelect';
import { SingleSelect, type SingleSelectProps } from './components/SingleSelect/SingleSelect';
import { useSelect, stableStringify } from './hooks/useSelect';
import type { AsyncSelectState, SelectFieldKeys } from './types';

interface SelectBaseProps {
  optionsEndpoint?: string;
  searchDebounceMs?: number;
  limit?: number;
  fieldKeys?: SelectFieldKeys;
  params?: Record<string, string | number | boolean>;
}

interface SelectSingleProps extends SingleSelectProps, SelectBaseProps {
  multiple?: false;
}

interface SelectMultiProps extends MultiSelectProps, SelectBaseProps {
  multiple: true;
}

export type SelectProps = SelectSingleProps | SelectMultiProps;

// Unified select field supporting single/multi selection and default/filter variants
export const Select = forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  const { multiple, optionsEndpoint, searchDebounceMs, limit, fieldKeys, params, ...rest } = props;

  // Params-keyed latch: enabled once opened for the current params, stays enabled until params change
  const [openedForParams, setOpenedForParams] = useState<string | null>(null);
  const currentParamsKey = stableStringify(params);
  const enabled = openedForParams === currentParamsKey;

  const selectData = useSelect({
    options: rest.options,
    groups: rest.groups,
    optionsEndpoint,
    searchDebounceMs,
    limit,
    fieldKeys,
    params,
    selectedValues: rest.value != null ? (Array.isArray(rest.value) ? rest.value : [rest.value]) : undefined,
    enabled,
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

  const childProps = {
    ...rest,
    options: selectData.options,
    groups: selectData.groups,
    asyncState,
  };

  // Latch open for current params on first open; params change resets enabled via derived state
  const handleOpenChange = (o: boolean) => {
    if (o && openedForParams !== currentParamsKey) setOpenedForParams(currentParamsKey);
  };

  if (multiple) {
    return <MultiSelect ref={ref} {...(childProps as MultiSelectProps)} onOpenChange={handleOpenChange} />;
  }
  return <SingleSelect ref={ref} {...(childProps as SingleSelectProps)} onOpenChange={handleOpenChange} />;
}) as React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLButtonElement>>;

Select.displayName = 'Select';
