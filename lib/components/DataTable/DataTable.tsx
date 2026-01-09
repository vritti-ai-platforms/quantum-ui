'use client';

import type {
  Cell,
  ColumnDef,
  ColumnFiltersState,
  Header,
  HeaderGroup,
  Row,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../../shadcn/shadcnDropdownMenu';
import { Input } from '../../../shadcn/shadcnInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shadcn/shadcnTable';
import { Button } from '../Button';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /**
   * Enable pagination
   * @default true
   */
  enablePagination?: boolean;
  /**
   * Enable sorting
   * @default false
   */
  enableSorting?: boolean;
  /**
   * Enable filtering
   * @default false
   */
  enableFiltering?: boolean;
  /**
   * Column ID to filter by (when enableFiltering is true)
   * If not provided, filtering will be available but no default input will be shown
   */
  filterColumn?: string;
  /**
   * Placeholder text for the filter input
   * @default "Filter..."
   */
  filterPlaceholder?: string;
  /**
   * Enable column visibility
   * @default false
   */
  enableColumnVisibility?: boolean;
  /**
   * Initial sorting state
   */
  initialSorting?: SortingState;
  /**
   * Initial column filters
   */
  initialColumnFilters?: ColumnFiltersState;
  /**
   * Initial column visibility
   */
  initialColumnVisibility?: VisibilityState;
  /**
   * Page size for pagination
   * @default 10
   */
  pageSize?: number;
  /**
   * Custom empty state message
   */
  emptyMessage?: React.ReactNode;
  /**
   * Custom className for the table container
   */
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enablePagination = true,
  enableSorting = false,
  enableFiltering = false,
  filterColumn,
  filterPlaceholder = 'Filter...',
  enableColumnVisibility = false,
  initialSorting = [],
  initialColumnFilters = [],
  initialColumnVisibility = {},
  pageSize = 10,
  emptyMessage = 'No results.',
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: enableFiltering ? setColumnFilters : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onColumnVisibilityChange: enableColumnVisibility ? setColumnVisibility : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
      columnVisibility: initialColumnVisibility,
    },
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnFilters: enableFiltering ? columnFilters : undefined,
      columnVisibility: enableColumnVisibility ? columnVisibility : undefined,
    },
  });

  return (
    <div className={className}>
      {(enableFiltering && filterColumn) || enableColumnVisibility ? (
        <div className="flex items-center py-4">
          {enableFiltering && filterColumn && (
            <Input
              placeholder={filterPlaceholder}
              value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          )}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value: boolean) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<TData, unknown>) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<TData>) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell: Cell<TData, TValue>) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {enablePagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {enableFiltering
              ? `${table.getFilteredRowModel().rows.length} of ${table.getCoreRowModel().rows.length} row(s)`
              : `${table.getCoreRowModel().rows.length} row(s)`}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </div>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';
