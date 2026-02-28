import type { Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import pluralize from 'pluralize-esm';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import type { DataTableMeta } from '../types';
import { exportToCSV } from '../utils';

interface DataTableSelectionBarProps<TData> {
  table: Table<TData>;
  children?: React.ReactNode;
  className?: string;
}

// Renders a selection info bar showing selected row count with export and clear actions
export function DataTableSelectionBar<TData>({ table, children, className }: DataTableSelectionBarProps<TData>) {
  const meta = table.options.meta as DataTableMeta | undefined;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;
  const itemLabel = meta?.slug ?? 'row';

  if (count === 0) return null;

  // Exports selected rows to CSV using the table slug as filename
  const handleExport = () => {
    exportToCSV(selectedRows, table.getAllColumns(), meta?.slug ?? 'export');
  };

  return (
    <div className={cn('flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg', className)}>
      <span className="text-sm font-medium text-primary mr-2">
        {count} {count === 1 ? singular : plural} selected
      </span>
      {children}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/15"
          onClick={() => table.toggleAllRowsSelected(false)}
        >
          Clear selection
        </Button>
      </div>
    </div>
  );
}

DataTableSelectionBar.displayName = 'DataTableSelectionBar';
