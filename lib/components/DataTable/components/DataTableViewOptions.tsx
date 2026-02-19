import type { Table } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../DropdownMenu/DropdownMenu';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  className?: string;
}

// Renders a column visibility toggle dropdown
export function DataTableViewOptions<TData>({ table, className }: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn('ml-auto hidden h-8 lg:flex', className)}>
          <Settings2 className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

DataTableViewOptions.displayName = 'DataTableViewOptions';
