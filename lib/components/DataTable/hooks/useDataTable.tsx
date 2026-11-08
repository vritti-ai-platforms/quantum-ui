import type { ColumnDef, Row } from '@tanstack/react-table';
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { deepEqual } from 'fast-equals';
import pluralize from 'pluralize-esm';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { DensityType, FilterCondition, TableViewState } from '../../../types/table-filter';
import { useDataTableStore } from '../store/store';
import { useTableSlice } from '../store/useTableSlice';
import { useAutoUpsert } from './useAutoUpsert';

export interface DataTableServerState<TData> {
  result?: TData[];
  count?: number;
  state?: TableViewState;
  activeViewId?: string | null;
}

interface UseDataTableOptions<TData> {
  columns: ColumnDef<TData, unknown>[];
  slug: string;
  label: string;
  serverState?: DataTableServerState<TData>;
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  enableHiding?: boolean;
  enableColumnResizing?: boolean;
  /** Called after the user's changes are saved — the page refetches its rows here */
  onStatePush?: () => unknown;
  /** Context bar defaults: each fills its field whenever `filters.context` is missing it — on the first load, on a view
   * switch, or when the default first becomes available. A context control with a default can't be cleared. */
  defaultContext?: FilterCondition[];
}

const NO_CONDITIONS: FilterCondition[] = [];

// Creates a fully configured TanStack Table instance with persisted state
export function useDataTable<TData>({
  columns,
  slug,
  label,
  serverState,
  enableMultiSort = true,
  enableRowSelection = true,
  enableHiding = true,
  enableSorting = true,
  enableColumnResizing = true,
  onStatePush,
  defaultContext,
}: UseDataTableOptions<TData>) {
  const {
    // State
    activeState,
    activeViewState,
    sorting,
    // Dirty flags
    isViewDirty,
    isFiltersDirty,
    isSearchDirty,
    // Actions
    updateActiveState,
    setFilters,
    setFilter,
    setContext,
    setSearch,
    setPagination,
    handleSortingChange,
  } = useTableSlice(slug);

  // Init in useLayoutEffect to avoid mutating the Zustand store during render (breaks useSyncExternalStore)
  const initializedSlug = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (initializedSlug.current !== slug) {
      useDataTableStore.getState().initTable(slug, { pinSelectColumn: enableRowSelection !== false });
      initializedSlug.current = slug;
    }
  }, [slug, enableRowSelection]);

  // Defaults compared by value, so an inline array doesn't refire every render
  const nextDefaults = defaultContext ?? NO_CONDITIONS;
  const [defaults, setDefaults] = useState(nextDefaults);
  if (!deepEqual(defaults, nextDefaults)) setDefaults(nextDefaults);

  // Shows the server's stored state once per visit, before paint; the store outlives the component, so a slug shown on
  // an earlier visit is shown again
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  useLayoutEffect(() => {
    if (!serverState?.state || loadedSlug === slug) return;
    useDataTableStore.getState().loadViewState(slug, serverState.state, serverState.activeViewId ?? null);
    setLoadedSlug(slug);
  }, [serverState?.state, serverState?.activeViewId, slug, loadedSlug]);

  // Ready to save once the stored state is shown — at once for a table whose server keeps no state
  const isReady = loadedSlug === slug || (serverState != null && serverState.state == null);

  // Fills each context default the shown state is missing, as though the user picked it, so it is saved and refetched
  const context = activeState.filters.context;
  useLayoutEffect(() => {
    if (loadedSlug !== slug) return;
    for (const condition of defaults) {
      if (!context.some((c) => c.field === condition.field)) setContext(condition.field, condition);
    }
  }, [loadedSlug, slug, defaults, context, setContext]);

  // The rows on screen were fetched without a context default while the server's echoed state still lacks it
  const isAwaitingDefaults =
    serverState?.state != null &&
    defaults.some((d) => !serverState.state?.filters.context.some((c) => c.field === d.field));

  // Column state — defaults come from EMPTY_TABLE_STATE via useTableSlice and loadViewState merge
  const { columnVisibility, columnOrder, columnSizing, columnPinning, lockedColumnSizing } = activeState;
  // Filter + UI state
  const { filterOrder, filterVisibility, density } = activeState;

  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

  const meta = useMemo(
    () => ({
      // Identity
      slug,
      singular: pluralize.singular(capitalizedLabel),
      plural: pluralize.plural(capitalizedLabel),

      // Column sizing
      lockedColumnSizing,
      toggleLockColumnSizing: () =>
        updateActiveState((prev) => ({ ...prev, lockedColumnSizing: !prev.lockedColumnSizing })),

      // Filter visibility & order
      filterOrder,
      filterVisibility,
      setFilterOrder: (order: string[]) => updateActiveState((prev) => ({ ...prev, filterOrder: order })),
      toggleFilterVisibility: (id: string) =>
        updateActiveState((prev) => ({
          ...prev,
          filterVisibility: { ...prev.filterVisibility, [id]: !(prev.filterVisibility[id] ?? true) },
        })),

      // Density
      density,
      setDensity: (d: DensityType) => updateActiveState((prev) => ({ ...prev, density: d })),

      // View dirty state
      isViewDirty,
      isFiltersDirty,
      isSearchDirty,
      activeViewState,

      // Filters
      setFilters: (filters: Parameters<typeof setFilters>[0]) => setFilters(filters),
      setFilter,
      setContext,
      defaultContext: defaults,
      isAwaitingDefaults,

      // Search
      search: activeState.search,
      setSearch,
    }),
    [
      slug,
      capitalizedLabel,
      lockedColumnSizing,
      filterOrder,
      filterVisibility,
      density,
      isViewDirty,
      isFiltersDirty,
      isSearchDirty,
      activeViewState,
      updateActiveState,
      setFilters,
      setFilter,
      setContext,
      defaults,
      isAwaitingDefaults,
      activeState.search,
      setSearch,
    ],
  );

  useAutoUpsert(slug, isReady, onStatePush);

  const data = serverState?.result ?? [];
  const totalRows = serverState?.count;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
      pagination: {
        pageIndex: activeState.pagination.limit > 0 ? activeState.pagination.offset / activeState.pagination.limit : 0,
        pageSize: activeState.pagination.limit,
      },
    },
    onSortingChange: handleSortingChange,
    onPaginationChange: (updater) => {
      const current = {
        pageIndex: activeState.pagination.limit > 0 ? activeState.pagination.offset / activeState.pagination.limit : 0,
        pageSize: activeState.pagination.limit,
      };
      const newVal = typeof updater === 'function' ? updater(current) : updater;
      setPagination({ limit: newVal.pageSize, offset: newVal.pageIndex * newVal.pageSize });
    },
    onColumnVisibilityChange: (updater) => {
      const current = activeState.columnVisibility;
      const newVal = typeof updater === 'function' ? updater(current) : updater;
      updateActiveState((prev) => ({ ...prev, columnVisibility: newVal }));
    },
    onColumnPinningChange: (updater) => {
      const current = activeState.columnPinning;
      const raw = typeof updater === 'function' ? updater(current) : updater;
      const newVal = { left: raw.left ?? [], right: raw.right ?? [] };
      updateActiveState((prev) => ({ ...prev, columnPinning: newVal }));
    },
    onColumnOrderChange: (updater) => {
      const current = activeState.columnOrder;
      const newVal = typeof updater === 'function' ? updater(current) : updater;
      updateActiveState((prev) => ({ ...prev, columnOrder: newVal }));
    },
    onColumnSizingChange: (updater) => {
      if (!lockedColumnSizing) {
        const current = activeState.columnSizing;
        const newVal = typeof updater === 'function' ? updater(current) : updater;
        updateActiveState((prev) => ({ ...prev, columnSizing: newVal }));
      }
    },
    columnResizeMode: 'onChange',
    enableColumnResizing: enableColumnResizing && !lockedColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    rowCount: totalRows ?? 0,
    enableSorting,
    enableMultiSort,
    enableRowSelection,
    enableHiding,
    meta,
  });

  return { table, context, isLoaded: isReady };
}
