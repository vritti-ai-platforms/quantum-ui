import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { useState } from 'react';
import type { UseDataTableOptions, UseDataTableReturn } from '../types';

// Creates and manages a TanStack Table instance with sensible defaults
export function useDataTable<TData>(options: UseDataTableOptions<TData>): UseDataTableReturn<TData> {
  const {
    data,
    columns,
    enableSorting = true,
    enableFiltering = true,
    enablePagination = true,
    enableRowSelection = false,
    enableColumnVisibility = true,
    enableMultiSort = false,
    enableGlobalFilter = true,
    initialSorting = [],
    initialPagination = { pageIndex: 0, pageSize: 10 },
    initialColumnVisibility = {},
    initialColumnFilters = [],
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
    pageCount,
    rowCount,
  } = options;

  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && !manualSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(enableFiltering && !manualFiltering && { getFilteredRowModel: getFilteredRowModel() }),
    ...(enablePagination && !manualPagination && { getPaginationRowModel: getPaginationRowModel() }),
    enableSorting,
    enableFilters: enableFiltering,
    enableColumnFilters: enableFiltering,
    enableGlobalFilter,
    enableRowSelection,
    enableHiding: enableColumnVisibility,
    enableMultiSort,
    manualPagination,
    manualSorting,
    manualFiltering,
    ...(pageCount !== undefined && { pageCount }),
    ...(rowCount !== undefined && { rowCount }),
  });

  return {
    table,
    globalFilter,
    setGlobalFilter,
  };
}
