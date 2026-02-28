import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import pluralize from 'pluralize-esm';
import { useState } from 'react';
import { Input } from '../../../../shadcn/shadcnInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shadcn/shadcnSelect';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import type { DataTableMeta } from '../types';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  className?: string;
}

// Renders pagination in a single row with info, controls, and nav buttons
export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
  className,
}: DataTablePaginationProps<TData>) {
  const [pageInputValue, setPageInputValue] = useState<string | null>(null);

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageSize = table.getState().pagination.pageSize;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const start = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRows);
  const rawSlug = (table.options.meta as DataTableMeta | undefined)?.slug ?? 'row';
  const slug = rawSlug.charAt(0).toUpperCase() + rawSlug.slice(1);
  const itemLabel = pluralize(slug, totalRows);

  // Navigates to the page number entered in the inline page input
  function handleGoToPage() {
    const pageNumber = Number.parseInt(pageInputValue ?? '', 10);
    if (!Number.isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      table.setPageIndex(pageNumber - 1);
    }
    setPageInputValue(null);
  }

  return (
    <div className={cn('flex items-center justify-between px-2 py-2', className)}>
      {/* Left: showing info */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          showing {start} to {end} of {totalRows} {itemLabel}
        </span>
      </div>

      {/* Right: rows per page + nav buttons */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">{pluralize(slug, 2)} per page</p>
          <Select value={`${pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
            <SelectTrigger size="sm" className="w-[70px]">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="flex items-center justify-center text-sm font-medium gap-1 px-1">
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              value={pageInputValue ?? currentPage}
              onFocus={(e) => {
                setPageInputValue(String(currentPage));
                requestAnimationFrame(() => e.target.select());
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d+$/.test(val)) setPageInputValue(val);
              }}
              onBlur={handleGoToPage}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGoToPage();
                  (e.target as HTMLInputElement).blur();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  if (table.getCanNextPage()) {
                    table.nextPage();
                    setPageInputValue(null);
                  }
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  if (table.getCanPreviousPage()) {
                    table.previousPage();
                    setPageInputValue(null);
                  }
                }
              }}
              className="w-10 h-8 px-1 text-sm text-center"
              aria-label="Current page"
            />
            <span className="text-muted-foreground">of {totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

DataTablePagination.displayName = 'DataTablePagination';
