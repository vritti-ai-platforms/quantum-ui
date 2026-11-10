import type { FilterCondition, SearchState, SortCondition } from './conditions';

export type DensityType = 'compact' | 'normal' | 'comfortable';

export interface TableFilters {
  panel: FilterCondition[];
  context: FilterCondition[];
}

export interface TableState {
  filters: TableFilters;
  sort: SortCondition[];
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  columnSizing: Record<string, number>;
  columnPinning: { left: string[]; right: string[] };
  lockedColumnSizing: boolean;
  density: DensityType;
  filterOrder: string[];
  filterVisibility: Record<string, boolean>;
  search: SearchState;
  pagination: { limit: number; offset: number };
}

export const EMPTY_TABLE_STATE: TableState = {
  filters: { panel: [], context: [] },
  sort: [],
  columnVisibility: {},
  columnOrder: [],
  columnSizing: {},
  columnPinning: { left: [], right: [] },
  lockedColumnSizing: false,
  density: 'normal',
  filterOrder: [],
  filterVisibility: {},
  search: null,
  pagination: { limit: 20, offset: 0 },
};
