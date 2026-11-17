import type React from 'react';
import { forwardRef, useState } from 'react';
import { usePermission } from '../PermissionGate';
import { MultiSelect, type MultiSelectProps } from './components/MultiSelect/MultiSelect';
import {
  SingleSelect,
  type SingleSelectClearableProps,
  type SingleSelectProps,
} from './components/SingleSelect/SingleSelect';
import { useSelect } from './hooks/useSelect';
import type { AsyncSelectState, SelectFieldKeys, SelectOption } from './types';

interface SelectBaseProps {
  optionsEndpoint?: string;
  searchDebounceMs?: number;
  limit?: number;
  fieldKeys?: SelectFieldKeys;
  params?: Record<string, string | number | boolean>;
}

interface SelectCommonProps
  extends Omit<SingleSelectProps & MultiSelectProps, 'value' | 'onChange' | 'clearable' | 'onOptionSelect'>,
    SelectBaseProps {
  multiple?: boolean;
  value?: SingleSelectProps['value'] | MultiSelectProps['value'];
  onChange?: SingleSelectProps['onChange'] | MultiSelectProps['onChange'];
}

// Wrappers that drop props from it use `DistributiveOmit` so each clearable branch keeps its own `onOptionSelect`
export type SelectProps = SelectCommonProps & SingleSelectClearableProps;

// The props of a wrapper that makes its select clearable unless it is passed `clearable={false}`: left out, `clearable`
// means true, so `onOptionSelect` may receive `null`
export type ClearableSelectProps = SelectCommonProps &
  (
    | { clearable?: true; onOptionSelect?: (option: SelectOption | null) => void }
    | { clearable: false; onOptionSelect?: (option: SelectOption) => void }
  );

export type SelectSingleProps = SelectProps;
export type SelectMultiProps = SelectProps;

// Unified select field supporting single/multi selection and default/filter variants
export const Select = forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  const { multiple, optionsEndpoint, searchDebounceMs, limit, fieldKeys, params, onOpenChange, ...rest } = props;
  const [open, setOpen] = useState(false);
  // Hidden fields must not fetch: drop the endpoint so the selected-label resolve query never fires
  const { granted } = usePermission(rest.permission);

  const selectData = useSelect({
    options: rest.options,
    groups: rest.groups,
    optionsEndpoint: granted ? optionsEndpoint : undefined,
    searchDebounceMs,
    limit,
    fieldKeys,
    params,
    selectedValues: rest.value != null ? (Array.isArray(rest.value) ? rest.value : [rest.value]) : undefined,
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
        searching: selectData.searching,
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

  // Scope async queries to the open popover lifecycle so reopening reuses cached data and refetches in the background.
  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    onOpenChange?.(o);
  };

  // render = role: the role doesn't grant this field, so it doesn't exist for this user
  if (!granted) return null;

  if (multiple) {
    return <MultiSelect ref={ref} {...(childProps as MultiSelectProps)} onOpenChange={handleOpenChange} />;
  }
  return <SingleSelect ref={ref} {...(childProps as SingleSelectProps)} onOpenChange={handleOpenChange} />;
}) as React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLButtonElement>>;

Select.displayName = 'Select';
