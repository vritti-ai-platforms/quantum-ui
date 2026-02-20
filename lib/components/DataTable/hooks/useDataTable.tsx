import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

export const useDataTable = ({ data, columns }: { data: unknown[]; columns: ColumnDef<unknown>[] }) => {
  const [sorting, setSorting] = useState<import('@tanstack/react-table').SortingState>([{ id: 'amount', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<import('@tanstack/react-table').ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<import('@tanstack/react-table').VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<import('@tanstack/react-table').RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<import('@tanstack/react-table').ColumnPinningState>({
    left: ['select'],
    right: [],
  });

  return useReactTable({
    data: data,
    columns: columns,
    state: { sorting, globalFilter, columnFilters, columnVisibility, rowSelection, columnPinning },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    enableMultiSort: true,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableHiding: true,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  });
};
