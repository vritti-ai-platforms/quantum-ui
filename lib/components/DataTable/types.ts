import type { PaginationState, Table } from '@tanstack/react-table';

export type { ColumnDef } from '@tanstack/react-table';

// ─── Feature config types ───

export interface DataTableSearchConfig {
  placeholder?: string;
}

export interface DataTablePaginationConfig {
  pageSizeOptions?: number[];
  itemLabel?: string;
  showGoToPage?: boolean;
  initial?: PaginationState;
}

export interface DataTableSelectionConfig {
  actions?: React.ReactNode;
}

export interface DataTableEmptyConfig {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export interface DataTableToolbarConfig {
  actions?: React.ReactNode;
}

export type DensityType = 'compact' | 'normal' | 'comfortable';

export interface DataTableMeta {
  lockedColumnSizing: boolean;
  toggleLockColumnSizing: () => void;
}

// ─── DataTable component props ───

export interface DataTableProps<TData> {
  table: Table<TData>;
  search?: DataTableSearchConfig;
  pagination?: DataTablePaginationConfig;
  selection?: DataTableSelectionConfig;
  empty?: DataTableEmptyConfig;
  toolbar?: DataTableToolbarConfig;
  isLoading?: boolean;
  maxHeight?: string;
  className?: string;
}
