import type { Row, Table } from '@tanstack/react-table';
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

// --- Import/Export config ---

export interface ImportExportColumn {
  key: string;
  label: string;
}

export interface ImportExportConfig<TData = unknown> {
  columns: ImportExportColumn[];
  sampleData?: Record<string, string>[];
  importEndpoint: string;
  exportEndpoint: string;
  transformExportRow?: (row: TData) => Record<string, unknown>;
  filename: string;
  onSuccess?: () => void;
}

// --- DataTable component props ---

export interface DataTableProps<TData> {
  table: Table<TData>;
  searchConfig?: DataTableSearchConfig;
  selectActions?: SelectActions<TData>;
  emptyStateConfig?: DataTableEmptyConfig;
  toolbarActions?: DataTableToolbarConfig;
  filters?: React.ReactNode[];
  isLoading?: boolean;
  className?: string;
  enableViews?: boolean;
  importExport?: ImportExportConfig<TData>;
  mode?: 'page' | 'compact';
  // Fires when a non-actions cell in a row is clicked. Highlights the matching row.
  onRowClick?: (row: TData) => void;
  // Returns the id of the externally-selected row (rendered with the `selected` data-state).
  selectedRowId?: string | null;
}
