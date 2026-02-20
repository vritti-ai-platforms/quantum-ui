import { useQuery } from '@tanstack/react-query';
import {
  type ColumnPinningState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useRef } from 'react';
import type {
  DataTableEmptyConfig,
  DataTableInstance,
  DataTableSelectionConfig,
  DataTableToolbarConfig,
  UseDataTableOptions,
} from '../types';
import { type TableState, useDataTableStore } from './useDataTableStore';

// Stable fallbacks — module-level so they never trigger re-renders
const DISABLED_QUERY_KEY = ['__disabled__'] as const;
const DISABLED_QUERY_FN = () => [] as never[];
const NOOP = () => {};

// Row model factories — called once at module level
const coreRowModel = getCoreRowModel();
const sortedRowModel = getSortedRowModel();
const filteredRowModel = getFilteredRowModel();
const paginatedRowModel = getPaginationRowModel();

interface ResolvedConfig {
  search: { placeholder: string } | null;
  pagination: { pageSizeOptions: number[]; itemLabel: string; showGoToPage: boolean } | null;
  sorting: { initial: SortingState; multi: boolean } | null;
  columnVisibility: { initial: VisibilityState } | null;
  selection: DataTableSelectionConfig | null;
  empty: Required<Pick<DataTableEmptyConfig, 'title' | 'description'>> & Pick<DataTableEmptyConfig, 'icon' | 'action'>;
  toolbar: DataTableToolbarConfig | null;
  initialPinning: ColumnPinningState;
  enableSorting: boolean;
  enablePagination: boolean;
  enableRowSelection: boolean;
  enableColumnVisibility: boolean;
  enableMultiSort: boolean;
  enableGlobalFilter: boolean;
  storeDefaults: Partial<TableState>;
}

// Resolves all config options with defaults — called once on mount
function resolveConfig<TData>(options: UseDataTableOptions<TData>): ResolvedConfig {
  const { search, pagination, sorting, columnVisibility, selection, empty, toolbar } = options;

  const searchResolved = search === false ? null : { placeholder: search?.placeholder ?? 'Search...' };

  const pageSizeOptions = pagination === false ? undefined : (pagination?.pageSizeOptions ?? [10, 20, 30, 50]);
  const paginationResolved = pagination === false
    ? null
    : {
        pageSizeOptions: pageSizeOptions!,
        itemLabel: pagination?.itemLabel ?? 'row(s)',
        showGoToPage: pagination?.showGoToPage ?? true,
      };

  const sortingResolved = sorting === false
    ? null
    : { initial: sorting?.initial ?? [], multi: sorting?.multi ?? true };

  const visibilityResolved = columnVisibility === false ? null : { initial: columnVisibility?.initial ?? {} };

  const selectionResolved = selection === false ? null : (selection ?? null);

  const emptyResolved = {
    icon: empty?.icon,
    title: empty?.title ?? 'No results',
    description: empty?.description ?? 'No data to display.',
    action: empty?.action,
  };

  const toolbarResolved = toolbar === false ? null : (toolbar ?? {});

  const hasSelection = selectionResolved !== null;
  const initialPinning: ColumnPinningState = hasSelection
    ? { left: ['select'], right: [] }
    : { left: [], right: [] };

  const initialPageSize = pagination === false
    ? 10
    : (pagination?.initial?.pageSize ?? pageSizeOptions?.[0] ?? 10);

  const initialPageIndex = pagination === false ? 0 : (pagination?.initial?.pageIndex ?? 0);

  return {
    search: searchResolved,
    pagination: paginationResolved,
    sorting: sortingResolved,
    columnVisibility: visibilityResolved,
    selection: selectionResolved,
    empty: emptyResolved,
    toolbar: toolbarResolved,
    initialPinning,
    enableSorting: sortingResolved !== null,
    enablePagination: paginationResolved !== null,
    enableRowSelection: hasSelection,
    enableColumnVisibility: visibilityResolved !== null,
    enableMultiSort: sortingResolved?.multi ?? false,
    enableGlobalFilter: searchResolved !== null,
    storeDefaults: {
      sorting: sortingResolved?.initial ?? [],
      pagination: { pageIndex: initialPageIndex, pageSize: initialPageSize },
      columnVisibility: visibilityResolved?.initial ?? {},
      columnPinning: initialPinning,
    },
  };
}

// Creates a DataTableInstance backed by zustand store for state persistence
export function useDataTable<TData>(tableId: string, options: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const {
    columns,
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
    pageCount,
    rowCount,
    isLoading: externalLoading,
    maxHeight,
    className,
  } = options;

  // Resolve all config defaults once on mount — stable reference, never recomputed
  const config = useRef(resolveConfig(options)).current;

  // Initialize store synchronously on first render so slice is available immediately
  const initTable = useDataTableStore((s) => s.initTable);
  const initialized = useRef(false);
  if (!initialized.current) {
    initTable(tableId, config.storeDefaults);
    initialized.current = true;
  }

  // Single selector — state + setters from store
  const slice = useDataTableStore((s) => s.tables[tableId]);

  // TanStack Query — stable fallbacks prevent observer churn
  const queryKey = 'queryKey' in options ? options.queryKey : undefined;
  const queryFn = 'queryFn' in options ? options.queryFn : undefined;
  const queryEnabled = !!(queryKey && queryFn);
  const { data: queryData, isLoading: queryLoading } = useQuery({
    queryKey: queryKey ?? DISABLED_QUERY_KEY,
    queryFn: queryFn ?? DISABLED_QUERY_FN,
    enabled: queryEnabled,
  });

  // Resolve data source
  const staticData = 'data' in options ? options.data : undefined;
  const data = queryEnabled ? ((queryData as TData[] | undefined) ?? []) : (staticData ?? []);
  const isLoading = externalLoading ?? (queryEnabled ? queryLoading : false);

  const table = useReactTable({
    data,
    columns,
    state: slice?.state,
    onSortingChange: slice?.setSorting ?? NOOP,
    onColumnFiltersChange: slice?.setColumnFilters ?? NOOP,
    onColumnVisibilityChange: slice?.setColumnVisibility ?? NOOP,
    onRowSelectionChange: slice?.setRowSelection ?? NOOP,
    onPaginationChange: slice?.setPagination ?? NOOP,
    onGlobalFilterChange: slice?.setGlobalFilter ?? NOOP,
    onColumnPinningChange: slice?.setColumnPinning ?? NOOP,
    getCoreRowModel: coreRowModel,
    ...(config.enableSorting && !manualSorting && { getSortedRowModel: sortedRowModel }),
    ...(config.enableGlobalFilter && !manualFiltering && { getFilteredRowModel: filteredRowModel }),
    ...(config.enablePagination && !manualPagination && { getPaginationRowModel: paginatedRowModel }),
    enableSorting: config.enableSorting,
    enableFilters: true,
    enableColumnFilters: true,
    enableGlobalFilter: config.enableGlobalFilter,
    enableRowSelection: config.enableRowSelection,
    enableHiding: config.enableColumnVisibility,
    enableMultiSort: config.enableMultiSort,
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount: pageCount ?? -1,
    rowCount: rowCount ?? -1,
  });

  return useMemo<DataTableInstance<TData>>(
    () => ({
      _table: table,
      globalFilter: slice?.state.globalFilter ?? '',
      setGlobalFilter: slice?.setGlobalFilter ?? NOOP,
      isLoading,
      search: config.search,
      pagination: config.pagination,
      selection: config.selection,
      empty: config.empty,
      toolbar: config.toolbar,
      maxHeight,
      className,
    }),
    [table, slice, isLoading, config, maxHeight, className],
  );
}
