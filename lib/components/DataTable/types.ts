import type { Column, ColumnDef, PaginationState, SortingState, Table, VisibilityState } from '@tanstack/react-table';

export type { ColumnDef } from '@tanstack/react-table';

// ─── Grouped config types ───

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

export interface DataTableSortingConfig {
  initial?: SortingState;
  multi?: boolean;
}

export interface DataTableColumnVisibilityConfig {
  initial?: VisibilityState;
}

// ─── useDataTable hook options (discriminated union) ───

interface BaseDataTableOptions<TData> {
  columns: ColumnDef<TData, unknown>[];

  search?: false | DataTableSearchConfig;
  pagination?: false | DataTablePaginationConfig;
  selection?: false | DataTableSelectionConfig;
  empty?: DataTableEmptyConfig;
  toolbar?: false | DataTableToolbarConfig;
  sorting?: false | DataTableSortingConfig;
  columnVisibility?: false | DataTableColumnVisibilityConfig;

  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  pageCount?: number;
  rowCount?: number;

  isLoading?: boolean;
  maxHeight?: string;
  className?: string;
}

interface WithQuery<TData> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData[]>;
  data?: never;
}

interface WithStaticData<TData> {
  queryKey?: never;
  queryFn?: never;
  data: TData[];
}

export type UseDataTableOptions<TData> = (WithQuery<TData> | WithStaticData<TData>) & BaseDataTableOptions<TData>;

// ─── DataTableInstance (what the hook returns) ───

export interface DataTableInstance<TData> {
  _table: Table<TData>;

  globalFilter: string;
  setGlobalFilter: (value: string) => void;

  isLoading: boolean;

  search: { placeholder: string } | null;
  pagination: {
    pageSizeOptions: number[];
    itemLabel: string;
    showGoToPage: boolean;
  } | null;
  selection: DataTableSelectionConfig | null;
  empty: Required<Pick<DataTableEmptyConfig, 'title' | 'description'>> & Pick<DataTableEmptyConfig, 'icon' | 'action'>;
  toolbar: DataTableToolbarConfig | null;

  maxHeight: string | undefined;
  className: string | undefined;
}

// ─── DataTable component props ───

export interface DataTableProps<TData> {
  table: DataTableInstance<TData>;
}

// ─── Sub-component props ───

export interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showSelectedCount?: boolean;
  showGoToPage?: boolean;
  itemLabel?: string;
  className?: string;
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  className?: string;
}

export interface DataTableEmptyProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export type DensityType = 'compact' | 'normal' | 'comfortable';

export interface DataTableSelectionBarProps {
  count: number;
  onClear: () => void;
  children?: React.ReactNode;
  className?: string;
}

export interface DataTableRowDensityProps {
  density: DensityType;
  onDensityChange: (density: DensityType) => void;
  className?: string;
}

export interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
