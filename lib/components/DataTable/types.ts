import type { PaginationState, Row, Table } from '@tanstack/react-table';

export type { ColumnDef } from '@tanstack/react-table';

// ─── Feature config types ───

export interface DataTableSearchConfig {
  placeholder?: string;
}

export interface DataTablePaginationConfig {
  pageSizeOptions?: number[];
  initial?: PaginationState;
}

export type SelectActions<TData> = (selectedRows: Row<TData>[]) => React.ReactNode;

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
  slug: string;
  singular: string;
  plural: string;
  lockedColumnSizing: boolean;
  toggleLockColumnSizing: () => void;
}

// ─── DataTable component props ───

export interface DataTableProps<TData> {
  table: Table<TData>;
  enableSearch?: DataTableSearchConfig;
  paginationConfig?: DataTablePaginationConfig;
  selectActions?: SelectActions<TData>;
  emptyStateConfig?: DataTableEmptyConfig;
  toolbarActions?: DataTableToolbarConfig;
  isLoading?: boolean;
  maxHeight?: string;
  className?: string;
}
