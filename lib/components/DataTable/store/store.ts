import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  SortingState,
  Updater,
  VisibilityState,
} from '@tanstack/react-table';
import { create } from 'zustand';

const MAX_TABLES = 20;

export interface TableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnPinning: ColumnPinningState;
  columnOrder: ColumnOrderState;
  columnSizing: ColumnSizingState;
  lockedColumnSizing: boolean;
  filterOrder: string[];
  filterVisibility: Record<string, boolean>;
  lastAccessed: number;
}

export interface TableSlice {
  tables: Record<string, TableState>;
  initTable: (slug: string, options?: { pinSelectColumn?: boolean }) => void;
  updateField: <K extends keyof TableState>(slug: string, field: K, updaterOrValue: Updater<TableState[K]>) => void;
}

const DEFAULT_TABLE_STATE: TableState = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  columnPinning: { left: [], right: [] },
  columnOrder: [],
  columnSizing: {},
  lockedColumnSizing: false,
  filterOrder: [],
  filterVisibility: {},
  lastAccessed: 0,
};

// Resolves TanStack's Updater<T> pattern — value or function
function resolveUpdater<T>(updaterOrValue: Updater<T>, current: T): T {
  return typeof updaterOrValue === 'function' ? (updaterOrValue as (prev: T) => T)(current) : updaterOrValue;
}

// Persists per-table state across renders with oldest-first eviction at capacity
export const useDataTableStore = create<TableSlice>((set, get) => ({
  tables: {},

  // Creates a table entry if absent — evicts least-recently-used when exceeding MAX_TABLES
  initTable: (slug, options) => {
    if (get().tables[slug]) return;

    set((state) => {
      const tables = { ...state.tables };
      const keys = Object.keys(tables);

      if (keys.length >= MAX_TABLES) {
        const lruKey = keys.reduce((oldest, key) =>
          tables[key].lastAccessed < tables[oldest].lastAccessed ? key : oldest,
        );
        delete tables[lruKey];
      }

      tables[slug] = {
        ...DEFAULT_TABLE_STATE,
        columnPinning: {
          left: options?.pinSelectColumn ? ['select'] : [],
          right: [],
        },
        lastAccessed: Date.now(),
      };
      return { tables };
    });
  },

  // Generic setter for any TableState field — resolves Updater pattern
  updateField: (slug, field, updaterOrValue) => {
    set((state) => {
      const currentTable = state.tables[slug];
      if (!currentTable) return state;

      const newValue = resolveUpdater(updaterOrValue, currentTable[field]);

      return {
        tables: {
          ...state.tables,
          [slug]: { ...currentTable, [field]: newValue, lastAccessed: Date.now() },
        },
      };
    });
  },
}));
