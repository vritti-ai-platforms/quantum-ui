import { flexRender } from '@tanstack/react-table';
import { Funnel } from 'lucide-react';
import { useState } from 'react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shadcn/shadcnTable';
import { cn } from '../../../shadcn/utils';
import { Button } from '../Button';
import { Skeleton } from '../Skeleton';
import { DataTableColumnHeader } from './components/DataTableColumnHeader';
import { DataTableEmpty } from './components/DataTableEmpty';
import { DataTableFilters } from './components/DataTableFilters';
import { DataTablePagination } from './components/DataTablePagination';
import { DataTableRowDensity } from './components/DataTableRowDensity';
import { DataTableSearch } from './components/DataTableSearch';
import { DataTableSelectionBar } from './components/DataTableSelectionBar';
import { DataTableViewOptions } from './components/DataTableViewOptions';
import { DataTableViewsMenu } from './components/DataTableViewsMenu';
import { DataTableViewTabs } from './components/DataTableViewTabs';
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
  filters,
  viewsConfig,
  isLoading = false,
  maxHeight = '700px',
  minHeight = '700px',
  className,
}: DataTableProps<TData>) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const meta = table.options.meta as DataTableMeta | undefined;
  const density = meta?.density ?? 'normal';
  const columnCount = table.getAllColumns().length;
  const visibilityEnabled = table.options.enableHiding !== false;
  const showToolbar = enableSearch || visibilityEnabled || toolbarActions || filters || viewsConfig;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center gap-4">
          {/* LEFT: view tabs (flex-1) when viewsConfig set; otherwise spacer */}
          <div className={cn('flex min-w-0', viewsConfig ? 'flex-1' : 'flex-1')}>
            {viewsConfig && <DataTableViewTabs config={viewsConfig} />}
          </div>

          {/* RIGHT: icon buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {enableSearch && (
              <DataTableSearch table={table} search={enableSearch.value} onSearchChange={enableSearch.onChange} />
            )}
            {filters && (
              <Button
                variant={filtersOpen ? 'secondary' : 'outline'}
                size="sm"
                className={cn('h-8 w-8 p-0', filtersOpen && 'border border-transparent')}
                onClick={() => setFiltersOpen((v) => !v)}
                aria-label="Toggle filters"
              >
                <Funnel className="h-4 w-4" />
              </Button>
            )}
            {visibilityEnabled && <DataTableViewOptions table={table} />}
            <DataTableRowDensity table={table as import('@tanstack/react-table').Table<unknown>} />
            {viewsConfig && <DataTableViewsMenu config={viewsConfig} />}
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
        {/* Sliding filter panel */}
        {filters && (
          <div
            className={cn(
              'grid transition-all duration-200 ease-in-out',
              filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div className="overflow-hidden">
              <DataTableFilters filters={filters} table={table} />
            </div>
          </div>
        )}
        <div className="relative w-full overflow-auto" style={{ maxHeight, minHeight }}>
          <table className="w-full caption-bottom text-sm" style={{ minWidth: table.getCenterTotalSize() }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const isActions = header.column.id === 'actions';
                    const headerAlignClass = isActions ? 'justify-end' : index > 0 ? 'justify-center' : undefined;
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: isActions ? '52px' : header.getSize() }}
                        className={cn('relative group/resize', isActions ? 'text-right' : index > 0 && 'text-center')}
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
                          <div className={cn('flex', headerAlignClass)}>
                            <DataTableColumnHeader column={header.column} title={header.column.columnDef.header} />
                          </div>
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
                    );
                  })}
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
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          densityClasses[density],
                          cell.column.id === 'actions' ? 'text-right' : index > 0 && 'text-center',
                        )}
                        style={{ width: cell.column.id === 'actions' ? '52px' : cell.column.getSize() }}
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
