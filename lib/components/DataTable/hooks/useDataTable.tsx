import type { ColumnDef, InitialTableState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRef } from 'react';
import { useDataTableStore } from '../store/store';

interface UseDataTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  slug: string;
  initialState?: InitialTableState;
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  enableGlobalFilter?: boolean;
  enableRowSelection?: boolean;
  enableHiding?: boolean;
  enableColumnResizing?: boolean;
}

// Creates a fully configured TanStack Table instance with persisted state
export function useDataTable<TData>({
  data,
  columns,
  slug,
  initialState = { pagination: { pageIndex: 0, pageSize: 10 } },
  enableGlobalFilter = true,
  enableMultiSort = true,
  enableRowSelection = true,
  enableHiding = true,
  enableSorting = true,
  enableColumnResizing = true,
}: UseDataTableOptions<TData>) {
  const initTable = useDataTableStore((s) => s.initTable);
  const updateField = useDataTableStore((s) => s.updateField);

  // Synchronous init — ensures store entry exists before selector reads
  const initializedSlug = useRef<string | null>(null);
  if (initializedSlug.current !== slug) {
    initTable(slug);
    initializedSlug.current = slug;
  }

  const tanstackState = useDataTableStore((s) => s.tables[slug]);

  // Separate custom fields from TanStack-compatible state
  const { lockedColumnSizing, ...state } = tanstackState ?? {};

  const table = useReactTable({
    data,
    columns,
    state,
    onSortingChange: (updater) => updateField(slug, 'sorting', updater),
    onColumnFiltersChange: (updater) => updateField(slug, 'columnFilters', updater),
    onColumnVisibilityChange: (updater) => updateField(slug, 'columnVisibility', updater),
    onColumnPinningChange: (updater) => updateField(slug, 'columnPinning', updater),
    onColumnOrderChange: (updater) => updateField(slug, 'columnOrder', updater),
    onColumnSizingChange: (updater) => {
      if (!lockedColumnSizing) {
        updateField(slug, 'columnSizing', updater);
      }
    },
    columnResizeMode: 'onChange',
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
    meta: {
      lockedColumnSizing,
      toggleLockColumnSizing: () => updateField(slug, 'lockedColumnSizing', !lockedColumnSizing),
    },
  });

  return table;
}
