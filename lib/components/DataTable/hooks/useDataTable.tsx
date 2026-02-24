import type { ColumnDef, InitialTableState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
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
}

// Creates a fully configured TanStack Table instance with all features enabled
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
}: UseDataTableOptions<TData>) {
  const tableState = useDataTableStore((state) => state.tables[slug]);
  const onColumnOrderChange = useDataTableStore((state) => state.onColumnOrderChange);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder: tableState?.columnOrder,
    },
    onColumnOrderChange: (updaterOrValue) => onColumnOrderChange(slug, updaterOrValue),
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
  });

  return table;
}
