import type { Table } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import {
  SingleSelectContent,
  SingleSelectList,
  SingleSelectRoot,
  SingleSelectRow,
  SingleSelectTrigger,
} from '../../Select';

interface DataTableSearchProps<TData> {
  table: Table<TData>;
  className?: string;
}

// Gets the display label for a column from its header definition
function getColumnLabel(columnDef: { header?: unknown }, fallbackId: string): string {
  return typeof columnDef.header === 'string' ? columnDef.header : fallbackId;
}

// Column-specific search with dropdown selector — collapsed icon button, expanded search bar
export function DataTableSearch<TData>({ table, className }: DataTableSearchProps<TData>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get filterable columns (exclude select/checkbox column)
  const filterableColumns = table
    .getAllLeafColumns()
    .filter((c) => typeof c.accessorFn !== 'undefined' && c.getCanFilter() && c.id !== 'select');

  // Derive initial selection from persisted columnFilters — falls back to first filterable column
  const [selectedColumnId, setSelectedColumnId] = useState(() => {
    const activeFilter = table.getState().columnFilters[0];
    if (activeFilter && filterableColumns.some((c) => c.id === activeFilter.id)) {
      return activeFilter.id;
    }
    return filterableColumns[0]?.id ?? '';
  });

  const selectedColumn = table.getColumn(selectedColumnId);
  const filterValue = (selectedColumn?.getFilterValue() as string) ?? '';
  const selectedLabel = selectedColumn ? getColumnLabel(selectedColumn.columnDef, selectedColumn.id) : '';

  // Auto-focus when expanding
  useEffect(() => {
    if (isExpanded) inputRef.current?.focus();
  }, [isExpanded]);

  // Clears the active column filter and collapses
  function handleCollapse() {
    selectedColumn?.setFilterValue(undefined);
    setIsExpanded(false);
  }

  // Switches to a different filter column — clears the old filter
  function handleColumnChange(columnId: string) {
    selectedColumn?.setFilterValue(undefined);
    setSelectedColumnId(columnId);
    setColumnSelectorOpen(false);
    inputRef.current?.focus();
  }

  if (!isExpanded) {
    return (
      <Button variant="outline" size="sm" className={cn('h-8 w-8 p-0', className)} onClick={() => setIsExpanded(true)}>
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    );
  }

  return (
    <div
      className={cn('flex items-center border border-input rounded-lg bg-background overflow-hidden h-9', className)}
    >
      {/* Column selector */}
      <SingleSelectRoot open={columnSelectorOpen} onOpenChange={setColumnSelectorOpen}>
        <SingleSelectTrigger
          className="border-0 shadow-none rounded-none border-r border-input min-h-0 h-full px-2.5 py-0 gap-1"
        >
          <span className="capitalize">{selectedLabel}</span>
        </SingleSelectTrigger>
        <SingleSelectContent align="start" className="w-[160px]">
          <SingleSelectList>
            {filterableColumns.map((column) => {
              const label = getColumnLabel(column.columnDef, column.id);
              return (
                <SingleSelectRow
                  key={column.id}
                  name={label}
                  selected={column.id === selectedColumnId}
                  onSelect={() => handleColumnChange(column.id)}
                  className="capitalize"
                />
              );
            })}
          </SingleSelectList>
        </SingleSelectContent>
      </SingleSelectRoot>

      {/* Search input */}
      <div className="flex items-center px-2 flex-1">
        <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={filterValue}
          onChange={(e) => selectedColumn?.setFilterValue(e.target.value || undefined)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCollapse();
          }}
          placeholder={`Search ${selectedLabel.toLowerCase()}...`}
          className="bg-transparent text-sm outline-none w-full min-w-[140px] placeholder:text-muted-foreground text-foreground"
        />
      </div>

      {/* Clear button */}
      <button
        type="button"
        onClick={handleCollapse}
        className="px-2 hover:bg-accent transition-colors h-full"
        aria-label="Close search"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

DataTableSearch.displayName = 'DataTableSearch';
