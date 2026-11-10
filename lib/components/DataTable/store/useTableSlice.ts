import type { SortingState } from '@tanstack/react-table';
import { deepEqual } from 'fast-equals';
import { useCallback, useMemo } from 'react';
import type { FilterCondition, SearchState } from '../../../types/conditions';
import type { TableState } from '../../../types/table-state';
import { EMPTY_TABLE_STATE } from '../../../types/table-state';
import { sortConditionsToTanstack, tanstackToSortConditions } from '../utils';
import { useDataTableStore, viewStatesEqual } from './store';

// Returns all state and slug-bound actions for a single table slice
export function useTableSlice(slug: string) {
  const activeState = useDataTableStore((s) => s.tables[slug]?.activeState ?? EMPTY_TABLE_STATE);
  const activeViewId = useDataTableStore((s) => s.tables[slug]?.activeViewId ?? null);
  const activeViewState = useDataTableStore((s) => s.tables[slug]?.activeViewState ?? null);
  const isViewDirty = useDataTableStore((s) => {
    const t = s.tables[slug];
    if (!t?.activeViewState) return false;
    return !viewStatesEqual(t.activeState, t.activeViewState);
  });
  const isFiltersDirty = useDataTableStore((s) => {
    const t = s.tables[slug];
    if (!t?.activeViewState) return false;
    return !deepEqual(t.activeState.filters.panel, t.activeViewState.filters.panel);
  });
  const isSearchDirty = useDataTableStore((s) => {
    const t = s.tables[slug];
    if (!t?.activeViewState) return false;
    return !deepEqual(t.activeState.search, t.activeViewState.search);
  });

  const _updateActiveState = useDataTableStore((s) => s.updateActiveState);
  const _setFilters = useDataTableStore((s) => s.setFilters);
  const _setFilter = useDataTableStore((s) => s.setFilter);
  const _setContext = useDataTableStore((s) => s.setContext);
  const _setSearch = useDataTableStore((s) => s.setSearch);
  const _setPagination = useDataTableStore((s) => s.setPagination);

  // Pre-bind slug so callers don't repeat it on every call
  const updateActiveState = useCallback(
    (updater: (prev: TableState) => TableState) => _updateActiveState(slug, updater),
    [slug, _updateActiveState],
  );

  const setFilters = useCallback((filters: FilterCondition[]) => _setFilters(slug, filters), [slug, _setFilters]);
  const setFilter = useCallback(
    (field: string, condition: FilterCondition | null) => _setFilter(slug, field, condition),
    [slug, _setFilter],
  );
  const setContext = useCallback(
    (field: string, condition: FilterCondition | null) => _setContext(slug, field, condition),
    [slug, _setContext],
  );
  const setSearch = useCallback((search: SearchState) => _setSearch(slug, search), [slug, _setSearch]);
  const setPagination = useCallback(
    (pagination: { limit: number; offset: number }) => _setPagination(slug, pagination),
    [slug, _setPagination],
  );

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
    activeViewState,
    sorting,
    isViewDirty,
    isFiltersDirty,
    isSearchDirty,
    updateActiveState,
    setFilters,
    setFilter,
    setContext,
    setSearch,
    setPagination,
    handleSortingChange,
  };
}
