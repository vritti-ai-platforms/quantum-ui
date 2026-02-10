import type { Reducer } from 'react';
import {
  type Option,
  type SingleSelectAction,
  SingleSelectActionType,
  type SingleSelectState,
} from './types';

/**
 * Reducer for SingleSelect component state management
 *
 * Handles 11 action types for managing dropdown state, loading states,
 * options management, pagination, and search functionality.
 */
export const singleSelectReducer: Reducer<SingleSelectState, SingleSelectAction> = (
  state: SingleSelectState,
  action: SingleSelectAction,
) => {
  const { actionType, stateChanges } = action;

  switch (actionType) {
    case SingleSelectActionType.OPEN: {
      return { ...state, open: true };
    }

    case SingleSelectActionType.CLOSE: {
      return {
        ...state,
        open: false,
        loadingInternalOptions: false,
      };
    }

    case SingleSelectActionType.LOAD_INTERNAL_OPTIONS_START: {
      return { ...state, loadingInternalOptions: true };
    }

    case SingleSelectActionType.LOAD_INTERNAL_OPTIONS_END: {
      return { ...state, loadingInternalOptions: false };
    }

    case SingleSelectActionType.LOAD_SELECTED_OPTIONS_START: {
      return { ...state, loadingInitialInternalOptions: true };
    }

    case SingleSelectActionType.LOAD_SELECTED_OPTIONS_END: {
      return { ...state, loadingInitialInternalOptions: false };
    }

    case SingleSelectActionType.SET_NETWORK_ERROR: {
      return { ...state, ...stateChanges };
    }

    case SingleSelectActionType.SET_SEARCH: {
      return {
        ...state,
        search: stateChanges?.search ?? null,
        hasMore: true,
      };
    }

    case SingleSelectActionType.CLEAR_SEARCH: {
      return {
        ...state,
        search: null,
        offset: 0,
        internalOptions: stateChanges?.internalOptions ?? [],
        internalOptionsMap: stateChanges?.internalOptionsMap ?? {},
      };
    }

    case SingleSelectActionType.SET_INTERNAL_OPTIONS: {
      return {
        ...state,
        internalOptions: stateChanges?.internalOptions ?? [],
        internalOptionsMap: stateChanges?.internalOptionsMap ?? {},
        loadingInternalOptions: false,
      };
    }

    case SingleSelectActionType.APPEND_INTERNAL_OPTIONS: {
      const newOptions = stateChanges?.newOptions ?? [];
      const combinedOptions = [...state.internalOptions, ...newOptions];

      // Deduplicate combined options to prevent duplicates from pagination
      const optionsMap = new Map<unknown, Option>();
      for (const option of combinedOptions) {
        const key = String(option.value);
        if (!optionsMap.has(key)) {
          optionsMap.set(key, option);
        }
      }
      const dedupedOptions = Array.from(optionsMap.values());

      return {
        ...state,
        internalOptions: dedupedOptions,
        internalOptionsMap: {
          ...state.internalOptionsMap,
          ...stateChanges?.internalOptionsMap,
        },
        loadingInternalOptions: false,
        limit: state.limit,
        offset: state.offset + (stateChanges?.persistOffset ? 0 : 10),
      };
    }

    case SingleSelectActionType.CHANGE_HAS_MORE_FLAG: {
      return {
        ...state,
        hasMore: !state.hasMore,
      };
    }

    default:
      return { ...state, ...stateChanges };
  }
};

export { SingleSelectActionType };
