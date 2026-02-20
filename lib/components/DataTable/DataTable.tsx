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
import type { DataTableProps, DensityType } from './types';

// Renders a full-featured data table from a DataTableInstance produced by useDataTable
export function DataTable<TData>({ table: instance }: DataTableProps<TData>) {
  const {
    _table,
    globalFilter,
    setGlobalFilter,
    isLoading,
    search: searchConfig,
    pagination: paginationConfig,
    selection: selectionConfig,
    empty: emptyConfig,
    toolbar: toolbarConfig,
    maxHeight,
    className,
  } = instance;

  const [density, setDensity] = useState<DensityType>('normal');

  const selectedCount = _table.getFilteredSelectedRowModel().rows.length;
  const columnCount = _table.getAllColumns().length;
  const isFiltered = _table.getState().columnFilters.length > 0 || globalFilter.length > 0;
  const visibilityEnabled = _table.options.enableHiding !== false;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toolbar */}
      {toolbarConfig !== null && (
        <div className="flex items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={() => {
                  _table.resetColumnFilters();
                  setGlobalFilter('');
                }}
                className="h-8 px-2 lg:px-3"
              >
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {searchConfig && (
              <DataTableSearch value={globalFilter} onChange={setGlobalFilter} placeholder={searchConfig.placeholder} />
            )}
            {visibilityEnabled && <DataTableViewOptions table={_table} />}
            <DataTableRowDensity density={density} onDensityChange={setDensity} />
            {toolbarConfig.actions}
          </div>
        </div>
      )}

      {/* Selection bar */}
      {selectionConfig && selectedCount > 0 && (
        <DataTableSelectionBar count={selectedCount} onClear={() => _table.toggleAllRowsSelected(false)}>
          {selectionConfig.actions}
        </DataTableSelectionBar>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <div className="relative w-full overflow-auto" style={{ maxHeight: maxHeight ?? '600px' }}>
          <table className="w-full caption-bottom text-sm">
            <TableHeader>
              {_table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : typeof header.column.columnDef.header === 'string' ? (
                        <DataTableColumnHeader column={header.column} title={header.column.columnDef.header} />
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: _table.getState().pagination.pageSize }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: columnCount }).map((_, cellIndex) => (
                      <TableCell key={`skeleton-cell-${cellIndex}`}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : _table.getRowModel().rows.length > 0 ? (
                _table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columnCount} className="h-24 text-center">
                    <DataTableEmpty
                      icon={emptyConfig.icon}
                      title={emptyConfig.title}
                      description={emptyConfig.description}
                      action={emptyConfig.action}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {paginationConfig && (
        <DataTablePagination
          table={_table}
          pageSizeOptions={paginationConfig.pageSizeOptions}
          itemLabel={paginationConfig.itemLabel}
          showGoToPage={paginationConfig.showGoToPage}
          showSelectedCount={selectionConfig !== null}
        />
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';
