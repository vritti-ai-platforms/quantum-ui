import type { Table } from '@tanstack/react-table';
import { ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import { SingleSelect } from '../../Select';
import type { SearchState } from '../types';

interface DataTableSearchProps<TData> {
  table: Table<TData>;
  search: SearchState;
  onSearchChange: (search: SearchState) => void;
  className?: string;
}

// Gets the display label for a column from its header definition
function getColumnLabel(columnDef: { header?: unknown }, fallbackId: string): string {
  return typeof columnDef.header === 'string' ? columnDef.header : fallbackId;
}

// Column-specific search with dropdown selector -- collapsed icon button, expanded search bar
export function DataTableSearch<TData>({ table, search, onSearchChange, className }: DataTableSearchProps<TData>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get searchable columns (exclude select/checkbox column)
  const searchableColumns = useMemo(
    () => table.getAllLeafColumns().filter((c) => typeof c.accessorFn !== 'undefined' && c.id !== 'select'),
    [table],
  );

  const options = useMemo(
    () => searchableColumns.map((c) => ({ value: c.id, label: getColumnLabel(c.columnDef, c.id) })),
    [searchableColumns],
  );

  // Derive initial column selection from persisted search state or fall back to first column
  const [selectedColumnId, setSelectedColumnId] = useState(() => {
    if (search?.columnId && searchableColumns.some((c) => c.id === search.columnId)) {
      return search.columnId;
    }
    return searchableColumns[0]?.id ?? '';
  });

  // Reset to first available if selected column is hidden/removed
  useEffect(() => {
    if (!searchableColumns.some((c) => c.id === selectedColumnId)) {
      setSelectedColumnId(searchableColumns[0]?.id ?? '');
    }
  }, [searchableColumns, selectedColumnId]);

  const selectedColumn = table.getColumn(selectedColumnId);
  const selectedLabel = selectedColumn ? getColumnLabel(selectedColumn.columnDef, selectedColumn.id) : '';

  // Displayed input value comes from the prop
  const inputValue = search?.columnId === selectedColumnId ? (search?.value ?? '') : '';

  // Auto-focus when expanding
  useEffect(() => {
    if (isExpanded) inputRef.current?.focus();
  }, [isExpanded]);

  // Clears the search and collapses
  function handleCollapse() {
    onSearchChange(null);
    setIsExpanded(false);
  }

  // Switches to a different search column
  function handleColumnChange(columnId: string) {
    setSelectedColumnId(columnId);
    if (inputValue) {
      onSearchChange({ columnId, value: inputValue });
    }
    // Defer focus until after Radix closes the popover and restores its own focus
    setTimeout(() => inputRef.current?.focus(), 0);
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
      <SingleSelect
        value={selectedColumnId}
        onChange={(val) => handleColumnChange(String(val))}
        options={options}
        contentClassName="w-[160px]"
        anchor={() => (
          <button
            type="button"
            className="flex items-center gap-1 h-full px-2.5 border-r border-input text-sm capitalize hover:bg-accent/50 transition-colors shrink-0"
          >
            {selectedLabel}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      />

      {/* Search input */}
      <div className="flex items-center px-2 flex-1">
        <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            const value = e.target.value;
            onSearchChange(value ? { columnId: selectedColumnId, value } : null);
          }}
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
