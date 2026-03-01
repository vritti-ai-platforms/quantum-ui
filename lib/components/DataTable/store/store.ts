import { create } from 'zustand';
import type { FilterCondition, TableViewState } from '../../../types/table-filter';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';

const MAX_TABLES = 20;

export interface TableState {
  activeState: TableViewState;
  isViewDirty: boolean;
  activeViewId: string | null;
  pendingFilters: FilterCondition[];
  lastAccessed: number;
}

export interface TableSlice {
  tables: Record<string, TableState>;
  initTable: (slug: string, options?: { pinSelectColumn?: boolean }) => void;
  loadViewState: (slug: string, state: TableViewState, viewId: string | null) => void;
  updateActiveState: (slug: string, updater: (prev: TableViewState) => TableViewState) => void;
  updatePendingFilter: (slug: string, field: string, condition: FilterCondition | undefined) => void;
  applyFilters: (slug: string) => void;
  resetFilters: (slug: string) => void;
  markClean: (slug: string) => void;
}

const DEFAULT_TABLE_STATE: TableState = {
  activeState: EMPTY_TABLE_STATE,
  isViewDirty: false,
  activeViewId: null,
  pendingFilters: [],
  lastAccessed: 0,
};

// Persists per-table state across renders with oldest-first eviction at capacity
export const useDataTableStore = create<TableSlice>((set, get) => ({
  tables: {},

  // Creates a table entry if absent -- evicts least-recently-used when exceeding MAX_TABLES
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

      const pinning = options?.pinSelectColumn
        ? { left: ['select'], right: [] }
        : { left: [], right: [] };

      tables[slug] = {
        ...DEFAULT_TABLE_STATE,
        activeState: { ...EMPTY_TABLE_STATE, columnPinning: pinning },
        lastAccessed: Date.now(),
      };
      return { tables };
    });
  },

  // Sets activeState, pendingFilters, activeViewId, and resets isViewDirty.
  // Merges with EMPTY_TABLE_STATE so old server payloads missing new fields still work.
  loadViewState: (slug, state, viewId) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      const mergedState = { ...EMPTY_TABLE_STATE, ...state };

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            activeState: mergedState,
            pendingFilters: mergedState.filters,
            activeViewId: viewId,
            isViewDirty: false,
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Applies an updater function to activeState and marks dirty if a view is active
  updateActiveState: (slug, updater) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      const newActiveState = updater(currentTable.activeState);

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            activeState: newActiveState,
            isViewDirty: currentTable.activeViewId !== null ? true : currentTable.isViewDirty,
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Updates only pendingFilters -- removes old field entry and adds new one if condition given
  updatePendingFilter: (slug, field, condition) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      const filtered = currentTable.pendingFilters.filter((f) => f.field !== field);
      const newPending = condition ? [...filtered, condition] : filtered;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            pendingFilters: newPending,
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Commits pendingFilters into activeState.filters and marks dirty if a view is active
  applyFilters: (slug) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      const newFilters = currentTable.pendingFilters;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            activeState: { ...currentTable.activeState, filters: newFilters },
            isViewDirty: currentTable.activeViewId !== null ? true : currentTable.isViewDirty,
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Clears both pendingFilters and activeState.filters
  resetFilters: (slug) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            pendingFilters: [],
            activeState: { ...currentTable.activeState, filters: [] },
            isViewDirty: currentTable.activeViewId !== null ? true : currentTable.isViewDirty,
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Resets isViewDirty to false
  markClean: (slug) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            isViewDirty: false,
          },
        },
      };
    });
  },
}));
