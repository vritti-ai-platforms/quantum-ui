import type { ColumnDef, InitialTableState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useRef } from 'react';
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

  // Synchronous init during render — intentional side-effect pattern.
  // The useRef guard prevents re-runs and initTable is idempotent (no-ops if slug exists).
  const initializedSlug = useRef<string | null>(null);
  if (initializedSlug.current !== slug) {
    initTable(slug, { pinSelectColumn: enableRowSelection });
    initializedSlug.current = slug;
  }

  const tanstackState = useDataTableStore((s) => s.tables[slug]);

  const { lockedColumnSizing, lastAccessed: _, ...state } = tanstackState ?? {};

  const meta = useMemo(
    () => ({
      slug,
      lockedColumnSizing,
      toggleLockColumnSizing: () => updateField(slug, 'lockedColumnSizing', !lockedColumnSizing),
    }),
    [slug, lockedColumnSizing, updateField],
  );

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
    meta,
  });

  return table;
}
