import type { Column, Table } from '@tanstack/react-table';
import { Columns, Eye, EyeOff, GripVertical, Lock, Pin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/shadcnPopover';
import { Switch } from '../../../../shadcn/shadcnSwitch';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import { SortableItem, SortableList } from '../../Sortable';
import type { DataTableMeta } from '../types';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  className?: string;
}

// Column row with draggable label area, pin, and visibility controls
function SortableColumnItem<TData>({ column }: { column: Column<TData, unknown> }) {
  const isPinned = column.getIsPinned();
  const isVisible = column.getIsVisible();
  const header = column.columnDef.header;
  const label = typeof header === 'string' ? header : column.id;

  return (
    <SortableItem id={column.id}>
      {({ isDragging, dragHandleProps }) => (
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition-colors',
            isDragging && 'opacity-50 bg-accent/30',
          )}
        >
          <div
            ref={dragHandleProps.ref}
            className="flex items-center gap-2 min-w-0 cursor-grab active:cursor-grabbing"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm truncate">{label}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => column.pin(isPinned ? false : 'left')}
              className={cn(
                'p-1 rounded-sm hover:bg-accent transition-colors',
                isPinned ? 'text-primary fill-primary' : 'text-muted-foreground',
              )}
              aria-label={isPinned ? `Unpin ${column.id}` : `Pin ${column.id}`}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => column.toggleVisibility()}
              className={cn(
                'p-1 rounded-sm hover:bg-accent transition-colors',
                isVisible ? 'text-muted-foreground' : 'text-muted-foreground/50',
              )}
              aria-label={isVisible ? `Hide ${column.id}` : `Show ${column.id}`}
            >
              {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}
    </SortableItem>
  );
}

// Column settings popover with drag-to-reorder, pin, and visibility controls
export function DataTableViewOptions<TData>({ table, className }: DataTableViewOptionsProps<TData>) {
  const meta = table.options.meta as DataTableMeta | undefined;

  // getAllLeafColumns respects columnOrder — getAllColumns does NOT
  const columns = table
    .getAllLeafColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());

  const sortableColumns = columns.map((col) => ({ id: col.id, column: col }));

  // Reorders the full column order array and persists via table.setColumnOrder
  function handleReorder(reordered: { id: string; column: Column<TData, unknown> }[]) {
    const currentOrder =
      table.getState().columnOrder.length > 0
        ? table.getState().columnOrder
        : table.getAllLeafColumns().map((c) => c.id);

    // Replace reorderable column positions while preserving non-reorderable ones (select, etc.)
    const reorderedIds = reordered.map((r) => r.id);
    const reorderableSet = new Set(columns.map((c) => c.id));
    let idx = 0;
    const newOrder = currentOrder.map((id) => (reorderableSet.has(id) ? reorderedIds[idx++] : id));

    table.setColumnOrder(newOrder);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-8 w-8 p-0', className)}>
          <Columns className="h-4 w-4" />
          <span className="sr-only">Column settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[260px] p-0">
        {/* Header */}
        <div className="px-3 py-3 border-b">
          <span className="text-sm font-medium">Column Settings</span>
          <p className="text-xs text-muted-foreground mt-0.5">Drag to reorder, pin, or hide columns</p>
        </div>

        {/* Resize Lock */}
        {meta?.toggleLockColumnSizing && (
          <div className="flex items-center justify-between px-3 py-2.5 border-b">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-sm">Resize Lock</span>
                <p className="text-xs text-muted-foreground">
                  {meta?.lockedColumnSizing ? 'Column sizes are locked' : 'Columns can be resized'}
                </p>
              </div>
            </div>
            <Switch
              size="sm"
              checked={meta?.lockedColumnSizing ?? false}
              onCheckedChange={() => meta?.toggleLockColumnSizing()}
              aria-label="Lock column sizes"
            />
          </div>
        )}

        {/* Column list */}
        <div className="max-h-[300px] overflow-y-auto py-1">
          <SortableList items={sortableColumns} onReorder={handleReorder}>
            {sortableColumns.map((item) => (
              <SortableColumnItem key={item.id} column={item.column} />
            ))}
          </SortableList>
        </div>
      </PopoverContent>
    </Popover>
  );
}

DataTableViewOptions.displayName = 'DataTableViewOptions';
