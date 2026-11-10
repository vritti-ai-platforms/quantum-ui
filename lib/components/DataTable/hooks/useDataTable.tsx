import type { ColumnDef, Row } from '@tanstack/react-table';
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { deepEqual } from 'fast-equals';
import pluralize from 'pluralize-esm';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { FilterCondition } from '../../../types/conditions';
import type { DensityType, TableState } from '../../../types/table-state';
import { hasEveryDefault, holdsResetDefaults, readValue, withDefaults } from '../../../utils/conditions';
import { useDataTableStore } from '../store/store';
import { useTableSlice } from '../store/useTableSlice';
import type { DataTableInstance } from '../types';
import { useAutoUpsert } from './useAutoUpsert';

export interface DataTableServerState<TData> {
  result?: TData[];
  count?: number;
  state?: TableState;
  activeViewId?: string | null;
}

export interface DataTableQuery<TData> {
  data?: DataTableServerState<TData>;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  refetch?: () => unknown;
}

interface UseDataTableOptions<TData> {
  columns: ColumnDef<TData, unknown>[];
  slug: string;
  label: string;
  query?: DataTableQuery<TData>;
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
  resetOnOpen?: string[];
}

const NO_CONDITIONS: FilterCondition[] = [];
const NO_FIELDS: string[] = [];

// The leaf column ids in definition order, resolved the way TanStack names columns
function leafColumnIds<TData>(columns: ColumnDef<TData, unknown>[]): string[] {
  return columns.flatMap((column) => {
    if ('columns' in column && column.columns) return leafColumnIds(column.columns);
    if (column.id) return [column.id];
    if ('accessorKey' in column && typeof column.accessorKey === 'string')
      return [column.accessorKey.replace(/\./g, '_')];
    return typeof column.header === 'string' ? [column.header] : [];
  });
}

// A saved column order that predates a column: the new one goes after its neighbour in the definitions (TanStack would
// put it last, past the actions and outside its group) and columns no longer defined drop out
function withDefinedColumns(savedOrder: string[], definedIds: string[]): string[] {
  if (savedOrder.length === 0) return savedOrder;
  const order = savedOrder.filter((id) => definedIds.includes(id));
  definedIds.forEach((id, index) => {
    if (order.includes(id)) return;
    const previous = definedIds
      .slice(0, index)
      .reverse()
      .find((defined) => order.includes(defined));
    order.splice(previous ? order.indexOf(previous) + 1 : 0, 0, id);
  });
  return order;
}

// Creates a fully configured TanStack Table instance with persisted state
export function useDataTable<TData>({
  columns,
  slug,
  label,
  query,
  enableMultiSort = true,
  enableRowSelection = true,
  enableHiding = true,
  enableSorting = true,
  enableColumnResizing = true,
  onStatePush,
  defaultContext,
  resetOnOpen = NO_FIELDS,
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const serverState = query?.data;
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

  // When the stored state is shown, each default it lacks is filled in as though the user picked it, so it is saved and
  // the rows refetched. On the first fill of a visit, a reset-on-open default also replaces the stored value.
  const context = activeState.filters.context;
  const openedSlug = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (loadedSlug !== slug) return;
    const isOpening = openedSlug.current !== slug;
    openedSlug.current = slug;
    const filled = withDefaults(context, defaults, { isOpening, resetOnOpen });
    const addedOrReplaced = filled.filter((condition) => !context.includes(condition));
    for (const condition of addedOrReplaced) setContext(condition.field, condition);
  }, [loadedSlug, slug, defaults, resetOnOpen, context, setContext]);

  const contextValue = useCallback((field: string) => readValue(context, field), [context]);

  // The context the server echoes back — the one the rows on screen were fetched with
  const echoedContext = serverState?.state?.filters.context;

  // The opening reset is done once the server echoes every reset-on-open default, or once the user picks a value
  const [resetDoneSlug, setResetDoneSlug] = useState<string | null>(null);
  const isAwaitingReset =
    resetDoneSlug !== slug && echoedContext != null && !holdsResetDefaults(echoedContext, defaults, resetOnOpen);
  useLayoutEffect(() => {
    if (echoedContext != null && !isAwaitingReset && resetDoneSlug !== slug) setResetDoneSlug(slug);
  }, [echoedContext, isAwaitingReset, resetDoneSlug, slug]);
  const setUserContext = useCallback(
    (...args: Parameters<typeof setContext>) => {
      setResetDoneSlug(slug);
      setContext(...args);
    },
    [slug, setContext],
  );

  // The rows on screen were fetched without a default, or with a value the opening reset replaces — keep the skeleton
  const isAwaitingDefaults = isAwaitingReset || (echoedContext != null && !hasEveryDefault(echoedContext, defaults));

  // Column state — defaults come from EMPTY_TABLE_STATE via useTableSlice and loadViewState merge
  const { columnVisibility, columnSizing, columnPinning, lockedColumnSizing } = activeState;
  const definedIds = useMemo(() => leafColumnIds(columns), [columns]);
  const columnOrder = useMemo(
    () => withDefinedColumns(activeState.columnOrder, definedIds),
    [activeState.columnOrder, definedIds],
  );
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
      setContext: setUserContext,
      contextValue,
      defaultContext: defaults,
      isAwaitingDefaults,
      isLoaded: isReady,

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
      setUserContext,
      contextValue,
      defaults,
      isAwaitingDefaults,
      isReady,
      activeState.search,
      setSearch,
    ],
  );

  const isSyncing = useAutoUpsert(slug, isReady, onStatePush);

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
      const current = columnOrder;
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

  // What <DataTable table={…}> renders: the table with the query's loading and error states
  return {
    table,
    isLoading: query?.isLoading ?? false,
    isFetching: query?.isFetching ?? false,
    isSyncing,
    isError: query?.isError ?? false,
    error: query?.error,
    refetch: query?.refetch,
    contextValue,
    isLoaded: isReady,
  };
}
