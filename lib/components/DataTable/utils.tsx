import type { CellContext, Column, ColumnDef, HeaderContext, Row, SortingState } from '@tanstack/react-table';
import * as xlsxLib from 'xlsx';
import type { SortCondition } from '../../types/table-filter';
import { Checkbox } from '../Checkbox';
import type { ImportExportConfig } from './types';

// Converts SortCondition[] to TanStack SortingState
export function sortConditionsToTanstack(sort: SortCondition[]): SortingState {
  return sort.map((s) => ({ id: s.field, desc: s.direction === 'desc' }));
}

// Converts TanStack SortingState to SortCondition[]
export function tanstackToSortConditions(sorting: SortingState): SortCondition[] {
  return sorting.map((s) => ({ field: s.id, direction: s.desc ? ('desc' as const) : ('asc' as const) }));
}

// Returns a pre-configured selection column with header checkbox (select all) and row checkbox
export function getSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    header: ({ table }: HeaderContext<TData, unknown>) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }: CellContext<TData, unknown>) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
  };
}

// Exports selected rows to a CSV file using visible column headers and row values
export function exportToCSV<TData>(rows: Row<TData>[], columns: Column<TData, unknown>[], filename: string): void {
  const exportColumns = columns.filter((col) => 'accessorKey' in col.columnDef && col.getIsVisible());

  const headers = exportColumns.map((col) => {
    const h = col.columnDef.header;
    return typeof h === 'string' ? h : col.id;
  });

  const csvRows = rows.map((row) => exportColumns.map((col) => String(row.getValue(col.id) ?? '')));

  const csvContent = [headers, ...csvRows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Downloads a blob as a file
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Transforms selected rows into flat export objects using importExport columns
function transformRows<TData>(rows: Row<TData>[], config: ImportExportConfig<TData>): Record<string, string>[] {
  return rows.map((row) => {
    const transformed = config.transformExportRow
      ? config.transformExportRow(row.original)
      : (row.original as Record<string, unknown>);
    const picked: Record<string, string> = {};
    for (const col of config.columns) {
      picked[col.label] = String(transformed[col.key] ?? '');
    }
    return picked;
  });
}

// Exports selected rows using importExport columns (round-trip compatible with import)
type ExportFormat = 'csv' | 'xlsx' | 'xls' | 'ods' | 'tsv';

const FORMAT_CONFIG: Record<ExportFormat, { ext: string; bookType: string; separator?: string }> = {
  csv: { ext: 'csv', bookType: 'csv' },
  xlsx: { ext: 'xlsx', bookType: 'xlsx' },
  xls: { ext: 'xls', bookType: 'biff8' },
  ods: { ext: 'ods', bookType: 'ods' },
  tsv: { ext: 'tsv', bookType: 'csv', separator: '\t' },
};

export function exportSelectedRows<TData>(
  rows: Row<TData>[],
  config: ImportExportConfig<TData>,
  format: ExportFormat,
): void {
  const data = transformRows(rows, config);
  const { ext, bookType, separator } = FORMAT_CONFIG[format];
  const { utils, write } = xlsxLib;
  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Sheet1');
  const opts = separator
    ? { type: 'array' as const, bookType: bookType as xlsxLib.BookType, FS: separator }
    : { type: 'array' as const, bookType: bookType as xlsxLib.BookType };
  const buf = write(wb, opts);
  downloadBlob(new Blob([buf]), `${config.filename}.${ext}`);
}
