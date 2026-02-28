import { flexRender } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { useState } from 'react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shadcn/shadcnTable';
import { cn } from '../../../shadcn/utils';
import { Button } from '../Button';
import { Skeleton } from '../Skeleton';
import { DataTableColumnHeader } from './components/DataTableColumnHeader';
import { DataTableEmpty } from './components/DataTableEmpty';
import { DataTablePagination } from './components/DataTablePagination';
import { DataTableRowDensity } from './components/DataTableRowDensity';
import { DataTableSearch } from './components/DataTableSearch';
import { DataTableSelectionBar } from './components/DataTableSelectionBar';
import { DataTableViewOptions } from './components/DataTableViewOptions';
import type { DataTableMeta, DataTableProps, DensityType } from './types';

const densityClasses: Record<DensityType, string> = {
  compact: 'py-1 px-2 text-xs',
  normal: 'py-2 px-4 text-sm',
  comfortable: 'py-4 px-4 text-sm',
};

// Renders a full-featured data table from a raw TanStack Table instance
export function DataTable<TData>({
  table,
  enableSearch,
  paginationConfig,
  selectActions,
  emptyStateConfig,
  toolbarActions,
  isLoading = false,
  maxHeight = '600px',
  className,
}: DataTableProps<TData>) {
  const [density, setDensity] = useState<DensityType>('normal');

  const meta = table.options.meta as DataTableMeta | undefined;
  const columnCount = table.getAllColumns().length;
  const isFiltered = table.getState().columnFilters.length > 0;
  const visibilityEnabled = table.options.enableHiding !== false;
  const showToolbar = enableSearch || visibilityEnabled || toolbarActions;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            {isFiltered && (
              <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {enableSearch && <DataTableSearch table={table} />}
            {visibilityEnabled && <DataTableViewOptions table={table} />}
            <DataTableRowDensity density={density} onDensityChange={setDensity} />
            {toolbarActions?.actions}
          </div>
        </div>
      )}

      {/* Selection bar */}
      <DataTableSelectionBar table={table}>
        {selectActions?.(table.getFilteredSelectedRowModel().rows)}
      </DataTableSelectionBar>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto" style={{ maxHeight }}>
          <table className="w-full caption-bottom text-sm" style={{ minWidth: table.getCenterTotalSize() }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                      className="relative group/resize"
                      aria-sort={
                        header.column.getCanSort()
                          ? header.column.getIsSorted() === 'asc'
                            ? 'ascending'
                            : header.column.getIsSorted() === 'desc'
                              ? 'descending'
                              : 'none'
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : typeof header.column.columnDef.header === 'string' ? (
                        <DataTableColumnHeader column={header.column} title={header.column.columnDef.header} />
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                      {!meta?.lockedColumnSizing && header.column.getCanResize() && (
                        <div
                          onPointerDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            'absolute top-0 right-0 w-1 h-full cursor-col-resize select-none touch-none',
                            'opacity-0 group-hover/resize:opacity-100 hover:bg-primary/50',
                            header.column.getIsResizing() && 'opacity-100 bg-primary',
                          )}
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: table.getState().pagination?.pageSize ?? 10 }, (_, i) => `skeleton-row-${i}`).map(
                  (rowKey) => (
                    <TableRow key={rowKey}>
                      {Array.from({ length: columnCount }, (_, i) => `${rowKey}-cell-${i}`).map((cellKey) => (
                        <TableCell key={cellKey} className={densityClasses[density]}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ),
                )
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={densityClasses[density]}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columnCount} className="h-24 text-center">
                    <DataTableEmpty
                      icon={emptyStateConfig?.icon}
                      title={emptyStateConfig?.title}
                      description={emptyStateConfig?.description}
                      action={emptyStateConfig?.action}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} pageSizeOptions={paginationConfig?.pageSizeOptions} />
    </div>
  );
}

DataTable.displayName = 'DataTable';
