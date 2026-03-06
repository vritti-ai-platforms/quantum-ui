import type { SortingState } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type { FilterCondition, SearchState, TableViewState } from '../../../types/table-filter';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';
import { sortConditionsToTanstack, tanstackToSortConditions } from '../utils';
import { useDataTableStore, viewStatesEqual } from './store';

// Returns all state and slug-bound actions for a single table slice
export function useTableSlice(slug: string) {
  const activeState = useDataTableStore((s) => s.tables[slug]?.activeState ?? EMPTY_TABLE_STATE);
  const activeViewId = useDataTableStore((s) => s.tables[slug]?.activeViewId ?? null);
  const isViewDirty = useDataTableStore((s) => {
    const t = s.tables[slug];
    if (!t?.activeViewState) return false;
    return !viewStatesEqual(t.activeState, t.activeViewState);
  });

  const _updateActiveState = useDataTableStore((s) => s.updateActiveState);
  const _setFilters = useDataTableStore((s) => s.setFilters);
  const _setSearch = useDataTableStore((s) => s.setSearch);
  const _setPagination = useDataTableStore((s) => s.setPagination);
  const _consumeSkipUpsert = useDataTableStore((s) => s.consumeSkipUpsert);

  // Pre-bind slug so callers don't repeat it on every call
  const updateActiveState = useCallback(
    (updater: (prev: TableViewState) => TableViewState) => _updateActiveState(slug, updater),
    [slug, _updateActiveState],
  );

  const setFilters = useCallback((filters: FilterCondition[]) => _setFilters(slug, filters), [slug, _setFilters]);
  const setSearch = useCallback((search: SearchState) => _setSearch(slug, search), [slug, _setSearch]);
  const setPagination = useCallback(
    (pagination: { limit: number; offset: number }) => _setPagination(slug, pagination),
    [slug, _setPagination],
  );

  const consumeSkipUpsert = useCallback(() => _consumeSkipUpsert(slug), [slug, _consumeSkipUpsert]);

  const sorting = useMemo(() => sortConditionsToTanstack(activeState.sort), [activeState.sort]);

  // Handles TanStack sort changes — resolves updater, converts to SortCondition[], writes to store
  const handleSortingChange = useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      updateActiveState((prev) => ({ ...prev, sort: tanstackToSortConditions(newSorting) }));
    },
    [sorting, updateActiveState],
  );

  return {
    activeState,
    activeViewId,
    sorting,
    isViewDirty,
    updateActiveState,
    setFilters,
    setSearch,
    setPagination,
    handleSortingChange,
    consumeSkipUpsert,
  };
}
