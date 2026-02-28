import type React from 'react';
import { forwardRef } from 'react';
import { MultiSelect, type MultiSelectProps } from './components/MultiSelect/MultiSelect';
import { MultiSelectFilter, type MultiSelectFilterProps } from './components/MultiSelect/MultiSelectFilter';
import { SingleSelect, type SingleSelectProps } from './components/SingleSelect/SingleSelect';
import { SingleSelectFilter, type SingleSelectFilterProps } from './components/SingleSelect/SingleSelectFilter';
import { useSelect } from './hooks/useSelect';
import type { AsyncSelectState, SelectFieldKeys, SelectVariant } from './types';

interface SelectBaseProps {
  optionsEndpoint?: string;
  searchDebounceMs?: number;
  limit?: number;
  fieldKeys?: SelectFieldKeys;
  params?: Record<string, string | number | boolean>;
}

interface SelectSingleProps extends SingleSelectProps, SelectBaseProps {
  multiple?: false;
  type?: SelectVariant;
}

interface SelectMultiProps extends MultiSelectProps, SelectBaseProps {
  multiple: true;
  type?: SelectVariant;
}

export type SelectProps = SelectSingleProps | SelectMultiProps;

// Unified select field supporting single/multi selection and default/filter variants
export const Select = forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  const { multiple, type = 'default', optionsEndpoint, searchDebounceMs, limit, fieldKeys, params, ...rest } = props;

  const selectData = useSelect({
    options: rest.options,
    groups: rest.groups,
    optionsEndpoint,
    searchDebounceMs,
    limit,
    fieldKeys,
    params,
    selectedValues: rest.value != null ? (Array.isArray(rest.value) ? rest.value : [rest.value]) : undefined,
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

  if (multiple) {
    if (type === 'filter') return <MultiSelectFilter ref={ref} {...(childProps as MultiSelectFilterProps)} />;
    return <MultiSelect ref={ref} {...(childProps as MultiSelectProps)} />;
  }
  if (type === 'filter') return <SingleSelectFilter ref={ref} {...(childProps as SingleSelectFilterProps)} />;
  return <SingleSelect ref={ref} {...(childProps as SingleSelectProps)} />;
}) as React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLButtonElement>>;

Select.displayName = 'Select';
