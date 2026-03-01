import type { PaginationState, Row, Table } from '@tanstack/react-table';
import type { DensityType, FilterCondition } from '../../types/table-filter';

export type { ColumnDef } from '@tanstack/react-table';

// Re-export DensityType for backward compatibility
export type { DensityType } from '../../types/table-filter';

// --- Feature config types ---

export type SearchState = { columnId: string; value: string } | null;

export interface DataTableSearchConfig {
  value: SearchState;
  onChange: (search: SearchState) => void;
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

export interface DataTableFilterItem {
  slug: string;
  label: string;
  node: React.ReactNode;
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
  pendingFilters: FilterCondition[];
  updatePendingFilter: (field: string, condition: FilterCondition | undefined) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  isFilterDirty: boolean;
}

// --- Views config ---

export interface DataTableViewsConfig {
  tableSlug: string;
  defaultLabel?: string;
  onStateApplied?: () => void;
}

// --- DataTable component props ---

export interface DataTableProps<TData> {
  table: Table<TData>;
  enableSearch?: DataTableSearchConfig;
  paginationConfig?: DataTablePaginationConfig;
  selectActions?: SelectActions<TData>;
  emptyStateConfig?: DataTableEmptyConfig;
  toolbarActions?: DataTableToolbarConfig;
  filters?: DataTableFilterItem[];
  viewsConfig?: DataTableViewsConfig;
  isLoading?: boolean;
  maxHeight?: string;
  minHeight?: string;
  className?: string;
}
