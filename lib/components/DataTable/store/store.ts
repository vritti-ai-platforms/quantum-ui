import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
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
}

export interface TableSlice {
  tables: Record<string, TableState>;
  initTable: (slug: string) => void;
  updateField: <K extends keyof TableState>(slug: string, field: K, updaterOrValue: Updater<TableState[K]>) => void;
}

const DEFAULT_TABLE_STATE: TableState = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  columnPinning: { left: ['select'], right: [] },
  columnOrder: [],
};

// Resolves TanStack's Updater<T> pattern — value or function
function resolveUpdater<T>(updaterOrValue: Updater<T>, current: T): T {
  return typeof updaterOrValue === 'function' ? (updaterOrValue as (prev: T) => T)(current) : updaterOrValue;
}

// Persists per-table state across renders with oldest-first eviction at capacity
export const useDataTableStore = create<TableSlice>((set, get) => ({
  tables: {},

  // Creates a table entry if absent — evicts oldest when exceeding MAX_TABLES
  initTable: (slug) => {
    if (get().tables[slug]) return;

    set((state) => {
      const tables = { ...state.tables };
      const keys = Object.keys(tables);

      if (keys.length >= MAX_TABLES) {
        delete tables[keys[0]];
      }

      tables[slug] = { ...DEFAULT_TABLE_STATE };
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
          [slug]: { ...currentTable, [field]: newValue },
        },
      };
    });
  },
}));
