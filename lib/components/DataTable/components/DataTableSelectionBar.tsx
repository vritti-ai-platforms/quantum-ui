import type { Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import { DropdownMenu } from '../../DropdownMenu';
import type { DataTableSelection, ImportExportConfig } from '../types';
import { exportSelectedRows } from '../utils';

interface DataTableSelectionBarProps<TData> {
  table: Table<TData>;
  selection: DataTableSelection<TData>;
  children?: React.ReactNode;
  className?: string;
  importExport?: ImportExportConfig<TData>;
  exportHidden?: boolean;
  exportLockTip?: string;
}

// All matching rows span pages that were never loaded here, so only a selection of ticked rows exports
const ALL_MATCHING_EXPORT_TIP = 'All matching rows are not loaded here — tick the rows to export instead';

// Renders a selection info bar showing selected row count with export and clear actions
export function DataTableSelectionBar<TData>({
  table,
  selection,
  children,
  className,
  importExport,
  exportHidden,
  exportLockTip,
}: DataTableSelectionBarProps<TData>) {
  const meta = table.options.meta;
  const count = selection.count;
  // "Select all N matching" once the whole page is ticked and the filters match more than it holds
  const offersAllMatching =
    selection.canSelectAllMatching &&
    !selection.allMatching &&
    table.getIsAllPageRowsSelected() &&
    selection.matchingCount > count;
  const singular = meta?.singular ?? 'row';
  const plural = meta?.plural ?? 'rows';

  if (count === 0) return null;

  // A table that declares no import template still exports its selection, taking the visible columns as the headers
  // and the table slug as the filename — so both paths offer the same formats instead of the bare one a CSV-only
  // fallback gave
  const exportConfig: ImportExportConfig<TData> = importExport ?? {
    columns: table
      .getAllLeafColumns()
      .filter((column) => 'accessorKey' in column.columnDef && column.getIsVisible())
      .map((column) => ({
        key: column.id,
        label:
          typeof column.columnDef.header === 'string'
            ? column.columnDef.header
            : (column.columnDef.meta?.label ?? column.id),
      })),
    filename: meta?.slug ?? 'export',
  };

  return (
    <div className={cn('flex items-center gap-2 px-4 py-3 border-b', className)}>
      <span className="text-sm font-medium mr-2">
        {selection.allMatching ? 'All ' : ''}
        {count} {count === 1 ? singular : plural} selected
      </span>
      {offersAllMatching && (
        <Button variant="link" size="sm" className="h-8 px-1" onClick={selection.selectAllMatching}>
          Select all {selection.matchingCount} matching
        </Button>
      )}
      {selection.allMatching && (
        <Button variant="link" size="sm" className="h-8 px-1" onClick={selection.clear}>
          Clear selection
        </Button>
      )}
      {children}
      <div className="ml-auto flex items-center gap-2">
        {exportHidden ? null : exportLockTip || selection.allMatching ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm"
            disabled
            disabledTip={exportLockTip ?? ALL_MATCHING_EXPORT_TIP}
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
                onClick: () => exportSelectedRows(selection.rows, exportConfig, 'csv'),
              },
              {
                type: 'item' as const,
                id: 'xlsx',
                label: 'Excel (.xlsx)',
                onClick: () => exportSelectedRows(selection.rows, exportConfig, 'xlsx'),
              },
              {
                type: 'item' as const,
                id: 'xls',
                label: 'Excel 97-2004 (.xls)',
                onClick: () => exportSelectedRows(selection.rows, exportConfig, 'xls'),
              },
              {
                type: 'item' as const,
                id: 'ods',
                label: 'OpenDocument (.ods)',
                onClick: () => exportSelectedRows(selection.rows, exportConfig, 'ods'),
              },
              {
                type: 'item' as const,
                id: 'tsv',
                label: 'TSV (.tsv)',
                onClick: () => exportSelectedRows(selection.rows, exportConfig, 'tsv'),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

DataTableSelectionBar.displayName = 'DataTableSelectionBar';
