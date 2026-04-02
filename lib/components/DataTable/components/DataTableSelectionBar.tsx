import type { Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import { DropdownMenu } from '../../DropdownMenu';
import type { DataTableMeta, ImportExportConfig } from '../types';
import { exportSelectedRows, exportToCSV } from '../utils';

interface DataTableSelectionBarProps<TData> {
  table: Table<TData>;
  children?: React.ReactNode;
  className?: string;
  importExport?: ImportExportConfig<TData>;
}

// Renders a selection info bar showing selected row count with export and clear actions
export function DataTableSelectionBar<TData>({ table, children, className, importExport }: DataTableSelectionBarProps<TData>) {
  const meta = table.options.meta as DataTableMeta | undefined;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;
  const singular = meta?.singular ?? 'row';
  const plural = meta?.plural ?? 'rows';

  if (count === 0) return null;

  // Exports selected rows to CSV using the table slug as filename (legacy behavior)
  const handleLegacyExport = () => {
    exportToCSV(selectedRows, table.getAllColumns(), meta?.slug ?? 'export');
  };

  return (
    <div className={cn('flex items-center gap-2 px-4 py-3 border-b', className)}>
      <span className="text-sm font-medium mr-2">
        {count} {count === 1 ? singular : plural} selected
      </span>
      {children}
      <div className="ml-auto flex items-center gap-2">
        {importExport ? (
          <DropdownMenu
            trigger={{ label: 'Export', variant: 'outline' as const, icon: Download, className: 'h-8 text-sm' }}
            items={[
              { type: 'item' as const, id: 'csv', label: 'CSV (.csv)', onClick: () => exportSelectedRows(selectedRows, importExport, 'csv') },
              { type: 'item' as const, id: 'xlsx', label: 'Excel (.xlsx)', onClick: () => exportSelectedRows(selectedRows, importExport, 'xlsx') },
              { type: 'item' as const, id: 'xls', label: 'Excel 97-2004 (.xls)', onClick: () => exportSelectedRows(selectedRows, importExport, 'xls') },
              { type: 'item' as const, id: 'ods', label: 'OpenDocument (.ods)', onClick: () => exportSelectedRows(selectedRows, importExport, 'ods') },
              { type: 'item' as const, id: 'tsv', label: 'TSV (.tsv)', onClick: () => exportSelectedRows(selectedRows, importExport, 'tsv') },
            ]}
          />
        ) : (
          <Button variant="outline" size="sm" onClick={handleLegacyExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}

DataTableSelectionBar.displayName = 'DataTableSelectionBar';
