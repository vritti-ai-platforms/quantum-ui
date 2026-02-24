// Main component

// Sub-components
export { DataTableColumnHeader } from './components/DataTableColumnHeader';
export { DataTableEmpty } from './components/DataTableEmpty';
export { DataTablePagination } from './components/DataTablePagination';
export { DataTableRowDensity } from './components/DataTableRowDensity';
export { DataTableSearch } from './components/DataTableSearch';
export { DataTableSelectionBar } from './components/DataTableSelectionBar';
export { DataTableViewOptions } from './components/DataTableViewOptions';
export { DataTable } from './DataTable';
export { useDataTable } from './hooks/useDataTable';
export { useDataTableStore } from './store/store';
export type { TableSlice, TableState } from './store/store';

// Types
export type {
  ColumnDef,
  DataTableEmptyConfig,
  DataTablePaginationConfig,
  DataTableProps,
  DataTableSearchConfig,
  DataTableSelectionConfig,
  DataTableToolbarConfig,
  DensityType,
} from './types';

// Utility
export { getSelectionColumn } from './utils';
