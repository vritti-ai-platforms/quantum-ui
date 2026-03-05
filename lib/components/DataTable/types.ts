import type { PaginationState, Row, Table } from '@tanstack/react-table';
import type { DensityType, FilterCondition, SearchState } from '../../types/table-filter';

export type { ColumnDef } from '@tanstack/react-table';

// Re-export for consumers
export type { DensityType, SearchState } from '../../types/table-filter';

// --- Feature config types ---

export interface SearchColumn {
  id: string;
  label: string;
}

export interface DataTableSearchConfig {
  columns: SearchColumn[];
  // When true, prepends an "All" option that searches across all provided columns
  searchAll?: boolean;
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

export interface DataTableMeta {
  slug: string;
  singular: string;
  plural: string;
  lockedColumnSizing: boolean;
  toggleLockColumnSizing: () => void;
  filterOrder: string[];
  filterVisibility: Record<string, boolean>;
  setFilterOrder: (order: string[]) => void;
  toggleFilterVisibility: (slug: string) => void;
  density: DensityType;
  setDensity: (d: DensityType) => void;
  isViewDirty: boolean;
  setFilters: (filters: FilterCondition[]) => void;
  search: SearchState;
  setSearch: (search: SearchState) => void;
}

// --- DataTable component props ---

export interface DataTableProps<TData> {
  table: Table<TData>;
  searchConfig?: DataTableSearchConfig;
  paginationConfig?: DataTablePaginationConfig;
  selectActions?: SelectActions<TData>;
  emptyStateConfig?: DataTableEmptyConfig;
  toolbarActions?: DataTableToolbarConfig;
  filters?: React.ReactNode[];
  onStateApplied?: () => void;
  isLoading?: boolean;
  maxHeight?: string;
  minHeight?: string;
  className?: string;
}
