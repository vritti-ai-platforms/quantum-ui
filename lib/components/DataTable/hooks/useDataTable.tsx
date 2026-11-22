import type { ColumnDef, Row, RowSelectionState } from '@tanstack/react-table';
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { deepEqual } from 'fast-equals';
import pluralize from 'pluralize-esm';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { FilterCondition } from '../../../types/conditions';
import type { DensityType, TableState } from '../../../types/table-state';
import { hasEveryDefault, holdsResetDefaults, readValue, withDefaults } from '../../../utils/conditions';
import { useDataTableStore } from '../store/store';
import { useTableSlice } from '../store/useTableSlice';
import type { DataTableInstance, DataTableSelection } from '../types';
import { useAutoUpsert } from './useAutoUpsert';

export interface DataTableServerState<TData> {
  result?: TData[];
  count?: number;
  // How many of the matching rows can be selected, when some can't (blocked, locked) — what "Select all N matching"
  // counts; the count stands in when absent
  selectableCount?: number;
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
  // Offers "Select all N matching" once a whole page is ticked: the selection then stands for every row the filters
  // match, minus the ones unticked after — read it from the instance's `selection`
  enableSelectAllMatching?: boolean;
  // A row's id, which keeps its tick across pages; defaults to the row's `id`, or its index when rows have no unique id
  getRowId?: (row: TData) => string;
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
const NO_ROW_SELECTION: RowSelectionState = {};

// A row's own `id`, when every row on the page has a distinct one
function rowIdsOf<TData>(rows: TData[]): string[] | null {
  const ids = rows.map((row) => (row as { id?: unknown } | null)?.id);
  if (!ids.every((id) => typeof id === 'string' || typeof id === 'number')) return null;
  const unique = new Set(ids.map(String));
  return unique.size === ids.length ? [...unique] : null;
}
const NO_FIELDS: string[] = [];
const NO_ROWS: never[] = [];

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
  enableSelectAllMatching = false,
  getRowId,
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

  const data = serverState?.result ?? NO_ROWS;
  const totalRows = serverState?.count;

  // Rows are ticked by id, so a tick stays with its row when the page changes; rows without a unique id fall back to
  // their index on the page
  const ownIds = useMemo(() => (getRowId ? null : rowIdsOf(data)), [getRowId, data]);
  const resolveRowId = useCallback(
    (row: TData, index: number) => (getRowId ? getRowId(row) : (ownIds?.[index] ?? String(index))),
    [getRowId, ownIds],
  );

  // Selection: ticked ids, or every matching row minus the unticked ones once all matching are selected
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(NO_ROW_SELECTION);
  const [allMatching, setAllMatching] = useState(false);
  const [excludedIds, setExcludedIds] = useState<ReadonlySet<string>>(() => new Set());
  const clearSelection = useCallback(() => {
    setAllMatching(false);
    setExcludedIds(new Set());
    setRowSelection(NO_ROW_SELECTION);
  }, []);
  const selectAllMatching = useCallback(() => {
    setExcludedIds(new Set());
    setAllMatching(true);
  }, []);

  // A selection is of the rows the filters and search matched; changing either starts it over
  const selectionScope = JSON.stringify([activeState.filters, activeState.search]);
  const scopeRef = useRef(selectionScope);
  useLayoutEffect(() => {
    if (scopeRef.current === selectionScope) return;
    scopeRef.current = selectionScope;
    clearSelection();
  }, [selectionScope, clearSelection]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
      pagination: {
        pageIndex: activeState.pagination.limit > 0 ? activeState.pagination.offset / activeState.pagination.limit : 0,
        pageSize: activeState.pagination.limit,
      },
    },
    getRowId: resolveRowId,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      if (allMatching) {
        // Clearing every tick (resetRowSelection, or unticking the whole page) ends the all-matching selection
        if (Object.values(next).every((ticked) => !ticked)) return clearSelection();
        setExcludedIds((previous) => {
          const excluded = new Set(previous);
          for (const id of Object.keys(rowSelection)) if (!next[id]) excluded.add(id);
          for (const [id, ticked] of Object.entries(next)) if (ticked) excluded.delete(id);
          return excluded;
        });
      }
      setRowSelection(next);
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

  // While all matching are selected, every selectable row on the page in view is ticked unless it was unticked — rerun
  // for each page of rows, since the table instance itself never changes
  useLayoutEffect(() => {
    if (!allMatching || data.length === 0) return;
    const ticked: RowSelectionState = {};
    for (const row of table.getRowModel().rows)
      if (row.getCanSelect() && !excludedIds.has(row.id)) ticked[row.id] = true;
    setRowSelection((previous) => (deepEqual(previous, ticked) ? previous : ticked));
  }, [allMatching, excludedIds, data, table]);

  const matchingCount = serverState?.selectableCount ?? totalRows ?? 0;
  const tickedIds = useMemo(
    () => Object.entries(rowSelection).flatMap(([id, ticked]) => (ticked ? [id] : [])),
    [rowSelection],
  );
  // Every row seen on any page, by id, so a row ticked on another page can still be read (exported) from here
  const seenRows = useRef(new Map<string, TData>());
  const tickedRows = useMemo(() => {
    data.forEach((row, index) => seenRows.current.set(resolveRowId(row, index), row));
    return tickedIds.flatMap((id) => seenRows.current.get(id) ?? []);
  }, [data, resolveRowId, tickedIds]);
  const selection = useMemo<DataTableSelection<TData>>(
    () => ({
      allMatching,
      ids: allMatching ? [] : tickedIds,
      rows: allMatching ? [] : tickedRows,
      excludedIds: allMatching ? [...excludedIds] : [],
      count: allMatching ? Math.max(0, matchingCount - excludedIds.size) : tickedIds.length,
      matchingCount,
      canSelectAllMatching: enableSelectAllMatching,
      selectAllMatching,
      clear: clearSelection,
    }),
    [
      allMatching,
      tickedIds,
      tickedRows,
      excludedIds,
      matchingCount,
      enableSelectAllMatching,
      selectAllMatching,
      clearSelection,
    ],
  );

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
    selection,
  };
}
