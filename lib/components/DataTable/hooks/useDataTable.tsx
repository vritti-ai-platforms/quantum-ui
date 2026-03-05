import type { ColumnDef, InitialTableState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import pluralize from 'pluralize-esm';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { DensityType, TableViewState } from '../../../types/table-filter';
import { useDataTableStore } from '../store/store';
import { useTableSlice } from '../store/useTableSlice';
import type { DataTableViewsConfig } from '../types';
import { useAutoUpsert } from './useAutoUpsert';

interface UseDataTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  slug: string;
  label: string;
  // Server-returned state loaded once on mount — enables init without boilerplate in the page
  serverState?: { state?: TableViewState; activeViewId?: string | null };
  initialState?: InitialTableState;
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  enableRowSelection?: boolean;
  enableHiding?: boolean;
  enableColumnResizing?: boolean;
  viewsConfig?: DataTableViewsConfig;
}

// Creates a fully configured TanStack Table instance with persisted state
export function useDataTable<TData>({
  data,
  columns,
  slug,
  label,
  serverState,
  initialState = { pagination: { pageIndex: 0, pageSize: 10 } },
  enableMultiSort = true,
  enableRowSelection = true,
  enableHiding = true,
  enableSorting = true,
  enableColumnResizing = true,
  viewsConfig,
}: UseDataTableOptions<TData>) {
  const {
    // State
    activeState,
    activeViewId,
    sorting,
    // Dirty flags
    isViewDirty,
    // Actions
    updateActiveState,
    setFilters,
    handleSortingChange,
    consumeSkipUpsert,
  } = useTableSlice(slug);

  // Loads server-returned state into the store once on first successful fetch
  const hasInitRef = useRef(false);
  useEffect(() => {
    if (!serverState?.state || hasInitRef.current) return;
    hasInitRef.current = true;
    useDataTableStore.getState().loadViewState(slug, serverState.state, serverState.activeViewId ?? null);
  }, [serverState?.state, serverState?.activeViewId, slug]);

  // Init in useLayoutEffect to avoid mutating the Zustand store during the render phase,
  // which would cause React's useSyncExternalStore consistency check to fail.
  const initializedSlug = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (initializedSlug.current !== slug) {
      useDataTableStore.getState().initTable(slug, { pinSelectColumn: enableRowSelection });
      initializedSlug.current = slug;
    }
  }, [slug, enableRowSelection]);

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

      // Filters
      setFilters: (filters: Parameters<typeof setFilters>[0]) => setFilters(filters),
    }),
    [
      slug,
      capitalizedLabel,
      lockedColumnSizing,
      filterOrder,
      filterVisibility,
      density,
      isViewDirty,
      updateActiveState,
      setFilters,
    ],
  );

  useAutoUpsert(slug, activeState, activeViewId, viewsConfig?.onStateApplied, consumeSkipUpsert);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
    },
    onSortingChange: handleSortingChange,
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
    columnResizeMode: 'onEnd',
    enableColumnResizing: enableColumnResizing && !lockedColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting,
    enableMultiSort,
    enableRowSelection,
    enableHiding,
    initialState,
    meta,
  });

  return { table };
}
