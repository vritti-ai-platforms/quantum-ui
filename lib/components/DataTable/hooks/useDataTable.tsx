import type { ColumnDef, InitialTableState, SortingState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import pluralize from 'pluralize-esm';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { upsertTableState } from '../../../services/table-views.service';
import type { DensityType, FilterCondition, SortCondition, TableViewState } from '../../../types/table-filter';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';
import { useDataTableStore } from '../store/store';
import type { DataTableViewsConfig } from '../types';

interface UseDataTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  slug: string;
  label?: string;
  initialState?: InitialTableState;
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  enableGlobalFilter?: boolean;
  enableRowSelection?: boolean;
  enableHiding?: boolean;
  enableColumnResizing?: boolean;
  onSortChange?: (sort: SortCondition[]) => void;
  viewsConfig?: DataTableViewsConfig;
}

// Converts SortCondition[] to TanStack SortingState
function sortConditionsToTanstack(sort: SortCondition[]): SortingState {
  return sort.map((s) => ({ id: s.field, desc: s.direction === 'desc' }));
}

// Creates a fully configured TanStack Table instance with persisted state
export function useDataTable<TData>({
  data,
  columns,
  slug,
  label,
  initialState = { pagination: { pageIndex: 0, pageSize: 10 } },
  enableGlobalFilter = true,
  enableMultiSort = true,
  enableRowSelection = true,
  enableHiding = true,
  enableSorting = true,
  enableColumnResizing = true,
  onSortChange,
  viewsConfig,
}: UseDataTableOptions<TData>) {
  const updateActiveState = useDataTableStore((s) => s.updateActiveState);

  // Init in useLayoutEffect to avoid mutating the Zustand store during the render phase,
  // which would cause React's useSyncExternalStore consistency check to fail.
  const initializedSlug = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (initializedSlug.current !== slug) {
      useDataTableStore.getState().initTable(slug, { pinSelectColumn: enableRowSelection });
      initializedSlug.current = slug;
    }
  }, [slug, enableRowSelection]);

  const tableEntry = useDataTableStore((s) => s.tables[slug]);
  const activeState = tableEntry?.activeState ?? EMPTY_TABLE_STATE;
  const pendingFilters = tableEntry?.pendingFilters ?? [];
  const isViewDirty = tableEntry?.isViewDirty ?? false;

  // Derive TanStack state from activeState — fallbacks guard against old server payloads
  const sorting = useMemo(() => sortConditionsToTanstack(activeState.sort ?? []), [activeState.sort]);
  const columnVisibility = activeState.columnVisibility ?? {};
  const columnOrder = activeState.columnOrder ?? [];
  const columnSizing = activeState.columnSizing ?? {};
  const columnPinning = activeState.columnPinning ?? { left: [], right: [] };
  const lockedColumnSizing = activeState.lockedColumnSizing ?? false;
  const filterOrder = activeState.filterOrder ?? [];
  const filterVisibility = activeState.filterVisibility ?? {};
  const density = activeState.density ?? 'normal';

  const rawLabel = label ?? slug;
  const capitalizedLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  // Store actions for meta
  const storeUpdatePendingFilter = useDataTableStore((s) => s.updatePendingFilter);
  const storeApplyFilters = useDataTableStore((s) => s.applyFilters);
  const storeResetFilters = useDataTableStore((s) => s.resetFilters);
  const isFilterDirty = useMemo(
    () => JSON.stringify(pendingFilters) !== JSON.stringify(activeState.filters),
    [pendingFilters, activeState.filters],
  );

  const meta = useMemo(
    () => ({
      slug,
      singular: pluralize.singular(capitalizedLabel),
      plural: pluralize.plural(capitalizedLabel),
      lockedColumnSizing,
      toggleLockColumnSizing: () =>
        updateActiveState(slug, (prev) => ({ ...prev, lockedColumnSizing: !prev.lockedColumnSizing })),
      filterOrder,
      filterVisibility,
      setFilterOrder: (order: string[]) => updateActiveState(slug, (prev) => ({ ...prev, filterOrder: order })),
      toggleFilterVisibility: (id: string) =>
        updateActiveState(slug, (prev) => ({
          ...prev,
          filterVisibility: { ...prev.filterVisibility, [id]: !(prev.filterVisibility[id] ?? true) },
        })),
      density,
      setDensity: (d: DensityType) => updateActiveState(slug, (prev) => ({ ...prev, density: d })),
      isViewDirty,
      pendingFilters,
      updatePendingFilter: (field: string, condition: FilterCondition | undefined) =>
        storeUpdatePendingFilter(slug, field, condition),
      applyFilters: () => storeApplyFilters(slug),
      resetFilters: () => storeResetFilters(slug),
      isFilterDirty,
    }),
    [
      slug,
      capitalizedLabel,
      lockedColumnSizing,
      filterOrder,
      filterVisibility,
      density,
      isViewDirty,
      pendingFilters,
      isFilterDirty,
      updateActiveState,
      storeUpdatePendingFilter,
      storeApplyFilters,
      storeResetFilters,
    ],
  );

  // Converts TanStack SortingState to SortCondition[] for the onSortChange callback
  const onSortChangeRef = useRef(onSortChange);
  onSortChangeRef.current = onSortChange;

  const viewsConfigRef = useRef(viewsConfig);
  viewsConfigRef.current = viewsConfig;

  const handleSortingChange = useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      const currentSorting = sorting;
      const newSorting = typeof updater === 'function' ? updater(currentSorting) : updater;
      const sortConditions: SortCondition[] = newSorting.map((s) => ({
        field: s.id,
        direction: s.desc ? ('desc' as const) : ('asc' as const),
      }));

      updateActiveState(slug, (prev) => ({ ...prev, sort: sortConditions }));

      // Notify external callback if provided
      onSortChangeRef.current?.(sortConditions);
    },
    [slug, sorting, updateActiveState],
  );

  // Auto-upsert via useEffect watching activeState with 150ms debounce
  const prevActiveStateRef = useRef<TableViewState>(activeState);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Skip initial render
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      prevActiveStateRef.current = activeState;
      return;
    }

    // Skip if same reference (no change)
    if (prevActiveStateRef.current === activeState) return;
    prevActiveStateRef.current = activeState;

    const vc = viewsConfigRef.current;
    if (!vc) return;

    const timer = setTimeout(() => {
      upsertTableState(vc.tableSlug, activeState).then(() => vc.onStateApplied?.());
    }, 150);

    return () => clearTimeout(timer);
  }, [activeState]);

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
      updateActiveState(slug, (prev) => ({ ...prev, columnVisibility: newVal }));
    },
    onColumnPinningChange: (updater) => {
      const current = activeState.columnPinning;
      const raw = typeof updater === 'function' ? updater(current) : updater;
      const newVal = { left: raw.left ?? [], right: raw.right ?? [] };
      updateActiveState(slug, (prev) => ({ ...prev, columnPinning: newVal }));
    },
    onColumnOrderChange: (updater) => {
      const current = activeState.columnOrder;
      const newVal = typeof updater === 'function' ? updater(current) : updater;
      updateActiveState(slug, (prev) => ({ ...prev, columnOrder: newVal }));
    },
    onColumnSizingChange: (updater) => {
      if (!lockedColumnSizing) {
        const current = activeState.columnSizing;
        const newVal = typeof updater === 'function' ? updater(current) : updater;
        updateActiveState(slug, (prev) => ({ ...prev, columnSizing: newVal }));
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
    enableGlobalFilter,
    enableRowSelection,
    enableHiding,
    initialState,
    meta,
  });

  return table;
}
