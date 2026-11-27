import type React from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type { FilterCondition } from '../../types/conditions';
import { bindFilters, boundFilterNames } from '../../utils/bindFilters';
import { withChange } from '../../utils/conditions';
import type { SelectContextInstance } from '../ContextBar/useContextState';
import { usePermission } from '../PermissionGate';
import { MultiSelect, type MultiSelectProps } from './components/MultiSelect/MultiSelect';
import {
  SingleSelect,
  type SingleSelectClearableProps,
  type SingleSelectProps,
} from './components/SingleSelect/SingleSelect';
import { useSelect } from './hooks/useSelect';
import type { AnySelectOption, AsyncSelectState, NoSelectFields, SelectedOption, SelectFieldKeys } from './types';

interface SelectBaseProps<TFields extends object, TKeys extends string> {
  optionsEndpoint?: string;
  searchDebounceMs?: number;
  limit?: number;
  // The response fields that fill an option; additionalKeys types the picked option's additionals
  fieldKeys?: SelectFieldKeys<TFields, TKeys>;
  params?: Record<string, string | number | boolean>;
  // The state of the filters in `header`, for a page that reads or sets them (a useContextState instance); without it
  // the select holds them itself. Either way each header filter's value goes out as a request param under the filter's
  // name, over a param of the same name; the context's other fields do not.
  // The select also keeps the context's selectedOptions in step with the options it holds
  context?: SelectContextInstance<SelectedOption<TFields, TKeys>>;
  // A single select's held option as the server returns it once the params or the header filters change — fresh
  // additionals, or null when it is no longer offered; not called for the first lookup or for a newly picked option
  onSelectionRefresh?: (option: SelectedOption<TFields, TKeys> | null) => void;
}

const NO_CONDITIONS: FilterCondition[] = [];
const NO_OPTIONS: AnySelectOption[] = [];
const NO_FIELDS = new Set<string>();

// The request params with each header filter's value under the filter's name, a list joined by commas; conditions of
// fields that are not header filters stay out
function withContextParams(
  params: Record<string, string | number | boolean> | undefined,
  conditions: FilterCondition[],
  headerFields: Set<string>,
): Record<string, string | number | boolean> | undefined {
  const entries = conditions.flatMap((condition): [string, string | number][] => {
    if (!headerFields.has(condition.field)) return [];
    const { value } = condition;
    if (Array.isArray(value)) return value.length > 0 ? [[condition.field, value.join(',')]] : [];
    if (typeof value === 'string' || typeof value === 'number') return value === '' ? [] : [[condition.field, value]];
    return [];
  });
  return entries.length > 0 ? { ...params, ...Object.fromEntries(entries) } : params;
}

type SelectCommonProps<TFields extends object, TKeys extends string> = Omit<
  SingleSelectProps<SelectedOption<TFields, TKeys>> & MultiSelectProps<SelectedOption<TFields, TKeys>>,
  'value' | 'onChange' | 'clearable' | 'onOptionSelect'
> &
  SelectBaseProps<TFields, TKeys> & {
    multiple?: boolean;
    value?: SingleSelectProps['value'] | MultiSelectProps['value'];
    onChange?: SingleSelectProps['onChange'] | MultiSelectProps['onChange'];
  };

// A select of an endpoint whose options carry TFields, typed by the additionalKeys TKeys it asks for: its picked options
// (onOptionSelect, onOptionsSelect, onSelectionRefresh, the option row and transforms) hold those fields only. Wrappers
// that drop props from it use `DistributiveOmit` so each clearable branch keeps its own `onOptionSelect`
export type SelectProps<TFields extends object = NoSelectFields, TKeys extends string = never> = SelectCommonProps<
  TFields,
  TKeys
> &
  SingleSelectClearableProps<SelectedOption<TFields, TKeys>>;

// The props of a wrapper that makes its select clearable unless it is passed `clearable={false}`: left out, `clearable`
// means true, so `onOptionSelect` may receive `null`
export type ClearableSelectProps<
  TFields extends object = NoSelectFields,
  TKeys extends string = never,
> = SelectCommonProps<TFields, TKeys> &
  (
    | { clearable?: true; onOptionSelect?: (option: SelectedOption<TFields, TKeys> | null) => void }
    | { clearable: false; onOptionSelect?: (option: SelectedOption<TFields, TKeys>) => void }
  );

// Unified select field supporting single/multi selection and default/filter variants
export const Select = forwardRef<HTMLButtonElement, SelectProps<object>>((props, ref) => {
  const {
    multiple,
    optionsEndpoint,
    searchDebounceMs,
    limit,
    fieldKeys,
    params,
    onOpenChange,
    context,
    onSelectionRefresh,
    ...rest
  } = props;
  const [open, setOpen] = useState(false);

  // The header's filters, held by the page's context when it passes one and by the select otherwise
  const [ownConditions, setOwnConditions] = useState<FilterCondition[]>(NO_CONDITIONS);
  const conditions = context?.context ?? ownConditions;
  const setCondition =
    context?.setContext ??
    ((field: string, condition: FilterCondition | null) =>
      setOwnConditions((current) => withChange(current, field, condition, [])));
  const header =
    rest.header == null
      ? rest.header
      : bindFilters(rest.header, {
          conditions,
          onChange: setCondition,
          keepControlled: true,
          required: context?.required,
          loading: context ? !context.isLoaded : false,
          onFieldSettling: context?.markFieldSettling,
        });

  // Hidden fields must not fetch: drop the endpoint so the selected-label resolve query never fires
  const { granted } = usePermission(rest.permission);

  const selectData = useSelect({
    options: rest.options,
    groups: rest.groups,
    optionsEndpoint: granted ? optionsEndpoint : undefined,
    searchDebounceMs,
    limit,
    fieldKeys,
    params: withContextParams(
      params,
      conditions,
      rest.header == null ? NO_FIELDS : boundFilterNames(rest.header, { keepControlled: true }),
    ),
    selectedValues: rest.value != null ? (Array.isArray(rest.value) ? rest.value : [rest.value]) : undefined,
    enabled: open,
    open,
  });

  const isAsync = !!optionsEndpoint;

  // The values held, as strings in their order, and the context's options for them, which the select keeps in step
  const heldValues = useMemo(
    () => (rest.value == null ? [] : (Array.isArray(rest.value) ? rest.value : [rest.value]).map(String)),
    [rest.value],
  );
  const heldKey = heldValues.join(',');
  const reportOptions = context?.setSelectedOptions;
  const reportedOptions = useRef(context?.selectedOptions ?? NO_OPTIONS);
  reportedOptions.current = context?.selectedOptions ?? NO_OPTIONS;

  // An emptied value (a form reset) holds no options
  useEffect(() => {
    if (heldKey === '') reportOptions?.(NO_OPTIONS);
  }, [heldKey, reportOptions]);

  // The held values and the params they were last looked up under: each settled lookup of other values or under other
  // params reports the options to the context — a value it no longer returns keeps the option it had — and one of the
  // same values under new params also tells a single select's page through onSelectionRefresh (null when it is no
  // longer offered)
  const lookedUp = useRef<{ valuesKey: string; paramsKey: string } | null>(null);
  const { heldOptions, paramsKey } = selectData;
  useEffect(() => {
    if ((!onSelectionRefresh && !reportOptions) || heldValues.length === 0 || !heldOptions) return;
    const previous = lookedUp.current;
    if (previous?.valuesKey === heldKey && previous.paramsKey === paramsKey) return;
    lookedUp.current = { valuesKey: heldKey, paramsKey };
    const optionOf = (options: readonly AnySelectOption[], value: string) =>
      options.find((option) => String(option.value) === value);
    reportOptions?.(
      heldValues.flatMap((value) => {
        const option = optionOf(heldOptions, value) ?? optionOf(reportedOptions.current, value);
        return option ? [option] : [];
      }),
    );
    if (previous?.valuesKey === heldKey && !multiple)
      onSelectionRefresh?.(optionOf(heldOptions, heldValues[0]) ?? null);
  }, [onSelectionRefresh, reportOptions, multiple, heldValues, heldKey, heldOptions, paramsKey]);

  // Picks report their options to the context as they are made, then reach the page's own handlers
  const reportingHandlers = reportOptions
    ? {
        onOptionSelect: (option: AnySelectOption | null) => {
          reportOptions(option ? [option] : NO_OPTIONS);
          (rest.onOptionSelect as ((option: AnySelectOption | null) => void) | undefined)?.(option);
        },
        onOptionsSelect: (options: AnySelectOption[]) => {
          reportOptions(options);
          rest.onOptionsSelect?.(options);
        },
      }
    : {};

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
    ...reportingHandlers,
    header,
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
}) as (<TFields extends object = NoSelectFields, TKeys extends string = never>(
  props: SelectProps<TFields, TKeys> & React.RefAttributes<HTMLButtonElement>,
) => React.ReactElement | null) & { displayName?: string };

Select.displayName = 'Select';
