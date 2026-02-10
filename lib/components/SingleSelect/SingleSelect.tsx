import axios from 'axios';
import { type SyntheticEvent, useCallback, useEffect, useMemo, useReducer } from 'react';
import { Typography } from '../Typography';
import { SingleFilter } from './components/SingleFilter';
import { SingleInput } from './components/SingleInput';
import { SingleSelectActionType, singleSelectReducer } from './reducer';
import type { DbLabelProps, DbValueProps, Option, SingleSelectProps, SingleSelectState } from './types';

/**
 * Generates a hash map from options array for O(1) lookups
 */
function generateOptionsMap(options: Option[], getValue?: (option: Option) => unknown): Record<string, Option> {
  const map: Record<string, Option> = {};
  for (const option of options ?? []) {
    const key = String(getValue ? getValue(option) : option.value);
    map[key] = option;
  }
  return map;
}

/**
 * Deduplicate options array by value
 * Returns new array with unique options (first occurrence kept)
 */
function deduplicateOptions(options: Option[], getValue?: (option: Option) => unknown): Option[] {
  const optionsMap = new Map<unknown, Option>();

  for (const option of options) {
    const key = getValue ? getValue(option) : option.value;
    if (!optionsMap.has(key)) {
      optionsMap.set(key, option);
    }
  }

  return Array.from(optionsMap.values());
}

/**
 * SingleSelect - A feature-rich single-value dropdown component
 *
 * Supports both static and API-driven data sources, with advanced capabilities like:
 * - Infinite scroll pagination
 * - Debounced search
 * - Flexible database field mapping
 * - Two display modes: input (form field) and filter (chip/badge)
 *
 * @component
 * @example
 * ```tsx
 * // Static options
 * <SingleSelect
 *   label="Status"
 *   value={status}
 *   onChange={setStatus}
 *   options={[
 *     { label: "Active", value: "active" },
 *     { label: "Inactive", value: "inactive" }
 *   ]}
 *   required
 *   fullWidth
 * />
 *
 * // API-driven
 * <SingleSelect
 *   label="User"
 *   value={userId}
 *   onChange={setUserId}
 *   optionsApiEndPoint="/api/users"
 *   dbValueProps={{ valueKey: "id", isInt: true }}
 *   dbLabelProps={{ labelKey: "name", subLabelKey: "email" }}
 *   placeholder="Select a user..."
 * />
 *
 * // Filter mode
 * <SingleSelect
 *   type="filter"
 *   label="Department"
 *   value={deptId}
 *   onChange={setDeptId}
 *   options={departments}
 * />
 * ```
 */
export const SingleSelect = ({
  options,
  optionsApiEndPoint,
  optionsApiEndpointParams,
  externalAxios,
  getValue,
  value,
  defaultValue,
  placeholder,
  onChange,
  dbValueProps = {
    valueKey: 'id',
    isObjectId: false,
    isInt: false,
    isFloat: false,
  } as DbValueProps,
  dbLabelProps = {
    labelKey: '',
    useLabelStartCase: false,
    useSubLabelStartCase: false,
  } as DbLabelProps,
  onOpen,
  onClose,
  type = 'input',
  ...restProps
}: SingleSelectProps) => {
  // Generate initial options map
  const initialOptionsMap = useMemo(
    () => generateOptionsMap(options ?? [], getValue),
    // Only compute on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getValue, options],
  );

  const initialState: SingleSelectState = {
    open: false,
    loadingInternalOptions: false,
    loadingInitialInternalOptions: false,
    internalOptions: options ?? [],
    internalOptionsMap: initialOptionsMap,
    limit: 10,
    offset: 0,
    hasMore: true,
    search: null,
  };

  const [state, dispatch] = useReducer(singleSelectReducer, initialState);
  const { internalOptions, limit, offset, hasMore, search } = state;

  const internalAxios = externalAxios || axios;

  // Prioritize value over defaultValue
  const effectiveValue = value !== undefined ? value : defaultValue;

  // Handle dropdown open
  const handleOpen = useCallback(
    async (event: SyntheticEvent) => {
      dispatch({ actionType: SingleSelectActionType.OPEN });

      // Deduplicate existing options before rendering
      if (internalOptions.length > 0) {
        const dedupedOptions = deduplicateOptions(internalOptions, getValue);

        // If duplicates were found, update state
        if (dedupedOptions.length !== internalOptions.length) {
          dispatch({
            actionType: SingleSelectActionType.SET_INTERNAL_OPTIONS,
            stateChanges: {
              internalOptions: dedupedOptions,
              internalOptionsMap: generateOptionsMap(dedupedOptions, getValue),
            },
          });
        }
      }

      // Fetch options from API if endpoint provided and options are empty/minimal
      if (optionsApiEndPoint && internalOptions.length <= 1) {
        try {
          dispatch({ actionType: SingleSelectActionType.LOAD_INTERNAL_OPTIONS_START });

          const response = await internalAxios.get(optionsApiEndPoint, {
            params: {
              limit,
              offset,
              dbValueProps: {
                valueKey: dbValueProps.valueKey,
                ...(dbValueProps.isObjectId && { isObjectId: true }),
                ...(dbValueProps.isInt && { isInt: true }),
                ...(dbValueProps.isFloat && { isFloat: true }),
                selectedValueData: value,
              },
              dbLabelProps,
              ...optionsApiEndpointParams,
            },
          });

          const fetchedOptions = response.data as Option[];

          if (internalOptions.length) {
            dispatch({
              actionType: SingleSelectActionType.APPEND_INTERNAL_OPTIONS,
              stateChanges: {
                newOptions: fetchedOptions,
                internalOptionsMap: generateOptionsMap(fetchedOptions, getValue),
                persistOffset: true,
              },
            });
          } else {
            dispatch({
              actionType: SingleSelectActionType.SET_INTERNAL_OPTIONS,
              stateChanges: {
                internalOptions: fetchedOptions,
                internalOptionsMap: generateOptionsMap(fetchedOptions, getValue),
              },
            });
          }
        } catch (e) {
          dispatch({
            actionType: SingleSelectActionType.SET_NETWORK_ERROR,
            stateChanges: { error: e },
          });
          dispatch({ actionType: SingleSelectActionType.LOAD_INTERNAL_OPTIONS_END });
        }
      }

      onOpen?.(event);
    },
    [
      optionsApiEndPoint,
      internalOptions.length,
      internalAxios,
      limit,
      offset,
      dbValueProps,
      dbLabelProps,
      optionsApiEndpointParams,
      value,
      getValue,
      onOpen,
    ],
  );

  // Handle dropdown close
  const handleClose = useCallback(
    (event: SyntheticEvent, reason: string) => {
      dispatch({ actionType: SingleSelectActionType.CLOSE });

      // Clear options (except selected) on close for API mode to save memory
      if (optionsApiEndPoint && reason !== 'selectOption') {
        const filteredOptions = internalOptions.filter(
          (o: Option) => (getValue ? getValue(o) : o.value) === effectiveValue,
        );
        dispatch({
          actionType: SingleSelectActionType.CLEAR_SEARCH,
          stateChanges: {
            internalOptions: filteredOptions,
            internalOptionsMap: generateOptionsMap(filteredOptions, getValue),
          },
        });
      }

      onClose?.(event, reason);
    },
    [optionsApiEndPoint, internalOptions, effectiveValue, getValue, onClose],
  );

  // Handle scroll for pagination
  const handleScroll = useCallback(
    async (event: React.UIEvent<HTMLFieldSetElement>) => {
      const listboxNode = event.currentTarget;

      // Check if scrolled to bottom
      if (
        listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 1 &&
        hasMore &&
        optionsApiEndPoint
      ) {
        dispatch({ actionType: SingleSelectActionType.LOAD_INTERNAL_OPTIONS_START });

        try {
          const response = await internalAxios.get(optionsApiEndPoint, {
            params: {
              limit,
              offset: offset + 10,
              dbValueProps: {
                valueKey: dbValueProps.valueKey,
                ...(dbValueProps.isObjectId && { isObjectId: true }),
                ...(dbValueProps.isInt && { isInt: true }),
                ...(dbValueProps.isFloat && { isFloat: true }),
                selectedValueData: effectiveValue,
              },
              dbLabelProps: {
                search,
                ...dbLabelProps,
              },
              ...optionsApiEndpointParams,
            },
          });

          const newOptions = response.data as Option[];

          // If fewer than 10 items returned, no more pages
          if (newOptions.length < 10) {
            dispatch({ actionType: SingleSelectActionType.CHANGE_HAS_MORE_FLAG });
          }

          dispatch({
            actionType: SingleSelectActionType.APPEND_INTERNAL_OPTIONS,
            stateChanges: {
              newOptions,
              internalOptionsMap: generateOptionsMap(newOptions, getValue),
            },
          });
        } catch (e) {
          dispatch({
            actionType: SingleSelectActionType.SET_NETWORK_ERROR,
            stateChanges: { error: e },
          });
          dispatch({ actionType: SingleSelectActionType.LOAD_INTERNAL_OPTIONS_END });
        }
      }
    },
    [
      hasMore,
      optionsApiEndPoint,
      internalAxios,
      limit,
      offset,
      dbValueProps,
      effectiveValue,
      search,
      dbLabelProps,
      optionsApiEndpointParams,
      getValue,
    ],
  );

  // Handle database search
  const searchDb = useCallback(
    async (searchValue: string) => {
      dispatch({
        actionType: SingleSelectActionType.SET_SEARCH,
        stateChanges: { search: searchValue },
      });

      // Clear search - reset to selected option only
      if (!searchValue || searchValue.trim() === '') {
        const filteredOptions = internalOptions.filter(
          (o: Option) => (getValue ? getValue(o) : o.value) === effectiveValue,
        );
        dispatch({
          actionType: SingleSelectActionType.CLEAR_SEARCH,
          stateChanges: {
            internalOptions: filteredOptions,
            internalOptionsMap: generateOptionsMap(filteredOptions, getValue),
          },
        });
        return;
      }

      if (optionsApiEndPoint) {
        try {
          dispatch({ actionType: SingleSelectActionType.LOAD_INTERNAL_OPTIONS_START });

          const response = await internalAxios.get(optionsApiEndPoint, {
            params: {
              limit,
              offset: 0,
              dbValueProps: {
                valueKey: dbValueProps.valueKey,
                ...(dbValueProps.isObjectId && { isObjectId: true }),
                ...(dbValueProps.isInt && { isInt: true }),
                ...(dbValueProps.isFloat && { isFloat: true }),
                selectedValueData: effectiveValue,
              },
              dbLabelProps: {
                search: searchValue,
                ...dbLabelProps,
              },
              ...optionsApiEndpointParams,
            },
          });

          const fetchedOptions = response.data as Option[];

          // Preserve selected option in results and deduplicate
          const selectedOptions = internalOptions.filter(
            (o: Option) => (getValue ? getValue(o) : o.value) === effectiveValue,
          );

          // Deduplicate: create map keyed by value to ensure each option appears once
          const optionsMap = new Map<unknown, Option>();

          // Add selected options first (will be included even if not in API results)
          for (const option of selectedOptions) {
            const key = getValue ? getValue(option) : option.value;
            optionsMap.set(key, option);
          }

          // Add fetched options (overwrites if duplicate - fetched data takes precedence)
          for (const option of fetchedOptions) {
            const key = getValue ? getValue(option) : option.value;
            optionsMap.set(key, option);
          }

          // Convert map back to array (guaranteed unique values)
          const combinedOptions = Array.from(optionsMap.values());

          dispatch({
            actionType: SingleSelectActionType.SET_INTERNAL_OPTIONS,
            stateChanges: {
              internalOptions: combinedOptions,
              internalOptionsMap: generateOptionsMap(combinedOptions, getValue),
            },
          });
        } catch (e) {
          dispatch({
            actionType: SingleSelectActionType.SET_NETWORK_ERROR,
            stateChanges: { error: e },
          });
          dispatch({ actionType: SingleSelectActionType.LOAD_INTERNAL_OPTIONS_END });
        }
      }
    },
    [
      internalOptions,
      effectiveValue,
      getValue,
      optionsApiEndPoint,
      internalAxios,
      limit,
      dbValueProps,
      dbLabelProps,
      optionsApiEndpointParams,
    ],
  );

  // Load selected option on mount if API mode with existing value
  useEffect(() => {
    const loadSelectedOptions = async () => {
      dispatch({ actionType: SingleSelectActionType.LOAD_SELECTED_OPTIONS_START });

      try {
        const response = await internalAxios.get(optionsApiEndPoint ?? '', {
          params: {
            limit,
            offset: 0,
            dbValueProps: {
              valueKey: dbValueProps.valueKey,
              ...(dbValueProps.isObjectId && { isObjectId: true }),
              ...(dbValueProps.isInt && { isInt: true }),
              ...(dbValueProps.isFloat && { isFloat: true }),
              selectedValueData: effectiveValue,
              filterBySelectedValues: true,
            },
            dbLabelProps,
            ...optionsApiEndpointParams,
          },
        });

        const fetchedOptions = response.data as Option[];

        dispatch({
          actionType: SingleSelectActionType.SET_INTERNAL_OPTIONS,
          stateChanges: {
            internalOptions: fetchedOptions,
            internalOptionsMap: generateOptionsMap(fetchedOptions, getValue),
          },
        });
      } catch (e) {
        dispatch({
          actionType: SingleSelectActionType.SET_NETWORK_ERROR,
          stateChanges: { error: e },
        });
      } finally {
        dispatch({ actionType: SingleSelectActionType.LOAD_SELECTED_OPTIONS_END });
      }
    };

    if (effectiveValue !== undefined && effectiveValue !== null && optionsApiEndPoint) {
      loadSelectedOptions();
    }
  }, [
    effectiveValue,
    optionsApiEndPoint,
    limit,
    dbValueProps.valueKey,
    dbValueProps.isObjectId,
    dbValueProps.isInt,
    dbValueProps.isFloat,
    dbLabelProps,
    optionsApiEndpointParams,
    getValue,
    internalAxios,
  ]);

  // Validation: onChange is required
  if (!onChange) {
    return (
      <Typography intent="error" variant="body2">
        SingleSelect: onChange prop is required
      </Typography>
    );
  }

  // Render filter variant
  if (type === 'filter') {
    return (
      <SingleFilter
        onChange={onChange}
        searchDb={searchDb}
        handleOpen={handleOpen}
        handleClose={handleClose}
        handleScroll={handleScroll}
        state={state}
        optionsApiEndPoint={optionsApiEndPoint}
        getValue={getValue}
        value={effectiveValue}
        placeholder={placeholder}
        dbLabelProps={dbLabelProps}
        {...restProps}
      />
    );
  }

  // Render input variant (default)
  return (
    <SingleInput
      onChange={onChange}
      searchDb={searchDb}
      handleOpen={handleOpen}
      handleClose={handleClose}
      handleScroll={handleScroll}
      state={state}
      optionsApiEndPoint={optionsApiEndPoint}
      getValue={getValue}
      value={effectiveValue}
      placeholder={placeholder}
      dbLabelProps={dbLabelProps}
      {...restProps}
    />
  );
};

SingleSelect.displayName = 'SingleSelect';
