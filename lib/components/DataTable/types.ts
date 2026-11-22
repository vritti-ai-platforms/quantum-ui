import type { Row, RowData, Table } from '@tanstack/react-table';
import type { FilterCondition, SearchState } from '../../types/conditions';
import type { DensityType, TableState } from '../../types/table-state';
import type { DataTableMode } from './modes';

export type { ColumnDef } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    grow?: boolean;
    // Names a column whose header renders a node, for the column settings and export
    label?: string;
  }

  interface TableMeta<TData extends RowData> extends DataTableMeta {}
}

export type { SearchState } from '../../types/conditions';
export type { DensityType } from '../../types/table-state';

// --- Feature config types ---

export interface SearchColumn {
  id: string;
  label: string;
}

export interface DataTableSearchConfig {
  columns: SearchColumn[];
  searchAll?: boolean;
}

// What a table has selected: the rows ticked by id (kept across pages), or — once "Select all N matching" is used — every
// row its filters match except the ones unticked since
export interface DataTableSelection<TData = unknown> {
  allMatching: boolean;
  // The ticked rows' ids while not selecting all matching
  ids: string[];
  // The ticked rows themselves, from whichever page they were ticked on; none while selecting all matching, whose rows
  // on other pages were never loaded
  rows: TData[];
  // The rows unticked while selecting all matching
  excludedIds: string[];
  // How many rows are selected, across pages
  count: number;
  // How many rows the filters match that can be selected — what "Select all N matching" selects
  matchingCount: number;
  // Whether the table offers "Select all N matching" (useDataTable's enableSelectAllMatching)
  canSelectAllMatching: boolean;
  selectAllMatching: () => void;
  clear: () => void;
}

// The selection bar's actions: the selected rows on the page in view, and the whole selection
export type SelectActions<TData> = (
  selectedRows: Row<TData>[],
  selection: DataTableSelection<TData>,
) => React.ReactNode;

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
  isFiltersDirty: boolean;
  isSearchDirty: boolean;
  activeViewState: TableState | null;
  setFilters: (filters: FilterCondition[]) => void;
  setFilter: (field: string, condition: FilterCondition | null) => void;
  setContext: (field: string, condition: FilterCondition | null) => void;
  contextValue: (field: string) => string | undefined;
  defaultContext: FilterCondition[];
  isAwaitingDefaults: boolean;
  isLoaded: boolean;
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
  importEndpoint?: string;
  exportEndpoint?: string;
  transformExportRow?: (row: TData) => Record<string, unknown>;
  filename: string;
  onSuccess?: () => void;
  importPermission?: string;
  exportPermission?: string;
}

// --- DataTable component props ---

export interface DataTableInstance<TData> {
  table: Table<TData>;
  isLoading: boolean;
  isFetching: boolean;
  /** A change (filter, sort, page, view) is waiting to be saved and refetched; the rows on screen predate it */
  isSyncing: boolean;
  isError: boolean;
  error: unknown;
  refetch?: () => unknown;
  contextValue: (field: string) => string | undefined;
  isLoaded: boolean;
  selection: DataTableSelection<TData>;
}

export interface DataTableProps<TData> {
  table: DataTableInstance<TData>;
  searchConfig?: DataTableSearchConfig;
  selectActions?: SelectActions<TData>;
  emptyStateConfig?: DataTableEmptyConfig;
  toolbarActions?: DataTableToolbarConfig;
  filters?: React.ReactNode[];
  /** Controls that set what the table is about (e.g. a site, an as-of date) rather than narrow it; shown at the start
   * of the toolbar, before the views, set apart by a separator. Named filter components here are filters kept in
   * `filters.context` — applied like filters, saved with views, not counted or reset. Elements with a `value` prop are
   * the page's. */
  contextBar?: React.ReactNode;
  className?: string;
  enableViews?: boolean;
  importExport?: ImportExportConfig<TData>;
  mode?: DataTableMode;
  permission?: string;
  onRowClick?: (row: TData) => void;
  selectedRowId?: string | null;
}
