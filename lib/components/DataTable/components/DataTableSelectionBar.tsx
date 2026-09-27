import type { Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import { DropdownMenu } from '../../DropdownMenu';
import type { DataTableMeta, ImportExportConfig } from '../types';
import { exportSelectedRows } from '../utils';

interface DataTableSelectionBarProps<TData> {
  table: Table<TData>;
  children?: React.ReactNode;
  className?: string;
  importExport?: ImportExportConfig<TData>;
  exportHidden?: boolean;
  exportLockTip?: string;
}

// Renders a selection info bar showing selected row count with export and clear actions
export function DataTableSelectionBar<TData>({
  table,
  children,
  className,
  importExport,
  exportHidden,
  exportLockTip,
}: DataTableSelectionBarProps<TData>) {
  const meta = table.options.meta as DataTableMeta | undefined;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;
  const singular = meta?.singular ?? 'row';
  const plural = meta?.plural ?? 'rows';

  if (count === 0) return null;

  // A table that declares no import template still exports its selection, taking the visible columns as the headers
  // and the table slug as the filename — so both paths offer the same formats instead of the bare one a CSV-only
  // fallback gave
  const exportConfig: ImportExportConfig<TData> = importExport ?? {
    columns: table
      .getAllColumns()
      .filter((column) => 'accessorKey' in column.columnDef && column.getIsVisible())
      .map((column) => ({
        key: column.id,
        label: typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
      })),
    filename: meta?.slug ?? 'export',
  };

  return (
    <div className={cn('flex items-center gap-2 px-4 py-3 border-b', className)}>
      <span className="text-sm font-medium mr-2">
        {count} {count === 1 ? singular : plural} selected
      </span>
      {children}
      <div className="ml-auto flex items-center gap-2">
        {exportHidden ? null : exportLockTip ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm"
            disabled
            disabledTip={exportLockTip}
            startAdornment={<Download className="h-4 w-4" />}
          >
            Export Selected
          </Button>
        ) : (
          <DropdownMenu
            trigger={{
              label: 'Export Selected',
              variant: 'outline' as const,
              icon: Download,
              className: 'h-8 text-sm',
            }}
            items={[
              {
                type: 'item' as const,
                id: 'csv',
                label: 'CSV (.csv)',
                onClick: () => exportSelectedRows(selectedRows, exportConfig, 'csv'),
              },
              {
                type: 'item' as const,
                id: 'xlsx',
                label: 'Excel (.xlsx)',
                onClick: () => exportSelectedRows(selectedRows, exportConfig, 'xlsx'),
              },
              {
                type: 'item' as const,
                id: 'xls',
                label: 'Excel 97-2004 (.xls)',
                onClick: () => exportSelectedRows(selectedRows, exportConfig, 'xls'),
              },
              {
                type: 'item' as const,
                id: 'ods',
                label: 'OpenDocument (.ods)',
                onClick: () => exportSelectedRows(selectedRows, exportConfig, 'ods'),
              },
              {
                type: 'item' as const,
                id: 'tsv',
                label: 'TSV (.tsv)',
                onClick: () => exportSelectedRows(selectedRows, exportConfig, 'tsv'),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

DataTableSelectionBar.displayName = 'DataTableSelectionBar';
