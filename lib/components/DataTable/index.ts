// Main component

export { setTableContext } from '../../services/table-views.service';
export type { CompactTableSkeletonColumn, CompactTableSkeletonProps } from './CompactTableSkeleton';
export { CompactTableSkeleton } from './CompactTableSkeleton';
// Cell components — wrap useFormatters() for consistent rendering with DetailField.
export type {
  CurrencyCellProps,
  DateCellProps,
  DateTimeCellProps,
  NumberCellProps,
  StringCellProps,
} from './cells/cells';
export { CurrencyCell, DateCell, DateTimeCell, NumberCell, StringCell } from './cells/cells';
// Sub-components
export { DataTableColumnHeader } from './components/DataTableColumnHeader';
export { DataTableEmpty } from './components/DataTableEmpty';
export { DataTableFilters } from './components/DataTableFilters';
export { DataTablePagination } from './components/DataTablePagination';
export { DataTableRowDensity } from './components/DataTableRowDensity';
export { DataTableSearch } from './components/DataTableSearch';
export { DataTableSelectionBar } from './components/DataTableSelectionBar';
export { DataTableViewOptions } from './components/DataTableViewOptions';
export type { RowAction, RowActionsProps } from './components/RowActions';
export { RowActions } from './components/RowActions';
export { DataTable } from './DataTable';
export type { DataTableQuery, DataTableServerState } from './hooks/useDataTable';
export { useDataTable } from './hooks/useDataTable';
// Types
export type {
  ColumnDef,
  DataTableEmptyConfig,
  DataTableInstance,
  DataTableMeta,
  DataTableProps,
  DataTableSearchConfig,
  DataTableToolbarConfig,
  DensityType,
  ImportExportColumn,
  ImportExportConfig,
  SearchColumn,
  SearchState,
  SelectActions,
} from './types';
// Utility
export { getSelectionColumn } from './utils';
