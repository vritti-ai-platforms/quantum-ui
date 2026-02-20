import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../../../../shadcn/shadcnInput';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showSelectedCount?: boolean;
  showGoToPage?: boolean;
  itemLabel?: string;
  className?: string;
}

// Renders pagination in a single row with info, controls, and nav buttons
export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
  showSelectedCount = false,
  showGoToPage = true,
  itemLabel = 'row(s)',
  className,
}: DataTablePaginationProps<TData>) {
  const [pageInputValue, setPageInputValue] = useState('');

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageSize = table.getState().pagination.pageSize;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const start = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRows);
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const handleGoToPage = () => {
    const pageNumber = Number.parseInt(pageInputValue, 10);
    if (!Number.isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      table.setPageIndex(pageNumber - 1);
      setPageInputValue('');
    }
  };

  return (
    <div className={cn('flex items-center justify-between px-2 py-2', className)}>
      {/* Left: showing info */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Showing {start} to {end} of {totalRows} {itemLabel}
        </span>
        {showSelectedCount && selectedCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Right: go-to-page + rows per page + nav buttons */}
      <div className="flex items-center gap-6">
        {showGoToPage && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Go to page:</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGoToPage();
              }}
              placeholder={currentPage.toString()}
              className="w-16 h-8 px-2 text-sm text-center"
            />
            <Button size="sm" variant="outline" onClick={handleGoToPage} disabled={!pageInputValue} className="h-8">
              Go
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
          <select
            className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

DataTablePagination.displayName = 'DataTablePagination';
