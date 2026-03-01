export type StringOperator = 'equals' | 'notEquals' | 'contains' | 'notContains';
export type NumberOperator = 'equals' | 'notEquals' | 'gt' | 'gte' | 'lt' | 'lte';
export type FilterOperator = StringOperator | NumberOperator;

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number;
}

export interface SortCondition {
  field: string;
  direction: 'asc' | 'desc';
}

export type DensityType = 'compact' | 'normal' | 'comfortable';

export interface TableViewState {
  filters: FilterCondition[];
  sort: SortCondition[];
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  columnSizing: Record<string, number>;
  columnPinning: { left: string[]; right: string[] };
  lockedColumnSizing: boolean;
  density: DensityType;
  filterOrder: string[];
  filterVisibility: Record<string, boolean>;
}

export const EMPTY_TABLE_STATE: TableViewState = {
  filters: [],
  sort: [],
  columnVisibility: {},
  columnOrder: [],
  columnSizing: {},
  columnPinning: { left: [], right: [] },
  lockedColumnSizing: false,
  density: 'normal',
  filterOrder: [],
  filterVisibility: {},
};
