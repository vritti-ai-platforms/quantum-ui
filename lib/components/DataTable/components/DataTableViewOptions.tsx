import type { Table } from '@tanstack/react-table';
import { Columns, Eye, EyeOff, Lock, Pin } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/shadcnPopover';
import { Switch } from '../../../../shadcn/shadcnSwitch';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  className?: string;
}

// Column settings popover with pin/visibility/resize lock controls
export function DataTableViewOptions<TData>({ table, className }: DataTableViewOptionsProps<TData>) {
  const [resizeLock, setResizeLock] = useState(false);

  const columns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-8 w-8 p-0', className)}>
          <Columns className="h-4 w-4" />
          <span className="sr-only">Column settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[260px] p-0">
        <div className="flex items-center justify-between px-3 py-2.5 border-b">
          <span className="text-sm font-medium">Column Settings</span>
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <Switch size="sm" checked={resizeLock} onCheckedChange={setResizeLock} aria-label="Toggle resize lock" />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto py-1">
          {columns.map((column) => {
            const isPinned = column.getIsPinned();
            const isVisible = column.getIsVisible();

            return (
              <div
                key={column.id}
                className="flex items-center justify-between px-3 py-1.5 hover:bg-accent/50 transition-colors"
              >
                <span className="text-sm capitalize truncate mr-2">{column.id}</span>
                <div className="flex items-center gap-1">
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
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

DataTableViewOptions.displayName = 'DataTableViewOptions';
