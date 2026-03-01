import type { CellContext, Column, ColumnDef, HeaderContext, Row } from '@tanstack/react-table';
import { Checkbox } from '../Checkbox';

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
export function exportToCSV<TData>(
  rows: Row<TData>[],
  columns: Column<TData, unknown>[],
  filename: string,
): void {
  const exportColumns = columns.filter(col => 'accessorKey' in col.columnDef && col.getIsVisible());

  const headers = exportColumns.map(col => {
    const h = col.columnDef.header;
    return typeof h === 'string' ? h : col.id;
  });

  const csvRows = rows.map(row =>
    exportColumns.map(col => String(row.getValue(col.id) ?? '')),
  );

  const csvContent = [headers, ...csvRows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
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
