import type { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '../../../../shadcn/utils';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

// Renders a sortable column header with hover-to-show sort indicators and pinned badge
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const isPinned = column.getIsPinned();

  const pinnedBadge = isPinned ? (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">Pinned</span>
  ) : null;

  if (!column.getCanSort()) {
    return (
      <span className={cn('font-medium flex items-center gap-2', className)}>
        {title}
        {pinnedBadge}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'flex items-center gap-2 cursor-pointer select-none group bg-transparent border-0 p-0 text-inherit',
        className,
      )}
      onClick={column.getToggleSortingHandler()}
    >
      <span className="font-medium">{title}</span>
      {pinnedBadge}
      {column.getIsSorted() === 'desc' ? (
        <ArrowDown className="h-4 w-4" />
      ) : column.getIsSorted() === 'asc' ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

DataTableColumnHeader.displayName = 'DataTableColumnHeader';
