// Main component

// Sub-components
export { DataTableColumnHeader } from './components/DataTableColumnHeader';
export { DataTableEmpty } from './components/DataTableEmpty';
export { DataTablePagination } from './components/DataTablePagination';
export { DataTableRowDensity } from './components/DataTableRowDensity';
export { DataTableSearch } from './components/DataTableSearch';
export { DataTableSelectionBar } from './components/DataTableSelectionBar';
export { DataTableToolbar } from './components/DataTableToolbar';
export { DataTableViewOptions } from './components/DataTableViewOptions';
export { DataTable } from './DataTable';

// Hooks
export { useDataTable } from './hooks/useDataTable';
export type { TableSlice, TableState } from './hooks/useDataTableStore';
export { useDataTableStore } from './hooks/useDataTableStore';
// Types
export type {
  ColumnDef,
  DataTableColumnHeaderProps,
  DataTableColumnVisibilityConfig,
  DataTableEmptyConfig,
  DataTableEmptyProps,
  DataTableInstance,
  DataTablePaginationConfig,
  DataTablePaginationProps,
  DataTableProps,
  DataTableRowDensityProps,
  DataTableSearchConfig,
  DataTableSearchProps,
  DataTableSelectionBarProps,
  DataTableSelectionConfig,
  DataTableSortingConfig,
  DataTableToolbarConfig,
  DataTableToolbarProps,
  DataTableViewOptionsProps,
  DensityType,
  UseDataTableOptions,
} from './types';

// Utility
export { getSelectionColumn } from './utils';
