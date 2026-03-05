import { deepEqual } from 'fast-equals';
import { create } from 'zustand';
import type { FilterCondition, SearchState, TableViewState } from '../../../types/table-filter';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';

const MAX_TABLES = 20;

// Compares two view states for equality — used by all dirty-check selectors
export function viewStatesEqual(a: TableViewState, b: TableViewState): boolean {
  return deepEqual(a, b);
}

export interface TableState {
  activeState: TableViewState;
  activeViewState: TableViewState | null;
  activeViewId: string | null;
  lastAccessed: number;
  _skipUpsert: boolean;
}

export interface TableSlice {
  tables: Record<string, TableState>;
  initTable: (slug: string, options?: { pinSelectColumn?: boolean }) => void;
  loadViewState: (slug: string, state: TableViewState, viewId: string | null, skipUpsert?: boolean) => void;
  updateActiveState: (slug: string, updater: (prev: TableViewState) => TableViewState) => void;
  setFilters: (slug: string, filters: FilterCondition[]) => void;
  setSearch: (slug: string, search: SearchState) => void;
  setPagination: (slug: string, pagination: { pageIndex: number; pageSize: number }) => void;
  setActiveViewState: (slug: string, viewState: TableViewState) => void;
  syncActiveViewState: (slug: string) => void;
  // Reads _skipUpsert, clears it, and returns whether it was set — consumed once per load
  consumeSkipUpsert: (slug: string) => boolean;
}

const DEFAULT_TABLE_STATE: TableState = {
  activeState: EMPTY_TABLE_STATE,
  activeViewState: null,
  activeViewId: null,
  lastAccessed: 0,
  _skipUpsert: false,
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

      const pinning = options?.pinSelectColumn ? { left: ['select'], right: [] } : { left: [], right: [] };

      tables[slug] = {
        ...DEFAULT_TABLE_STATE,
        activeState: { ...EMPTY_TABLE_STATE, columnPinning: pinning },
        lastAccessed: Date.now(),
      };
      return { tables };
    });
  },

  // Sets activeState, activeViewId, and activeViewState.
  // Merges with EMPTY_TABLE_STATE so old server payloads missing new fields still work.
  // skipUpsert defaults to true (page-load); pass false for user-driven tab activation.
  loadViewState: (slug, state, viewId, skipUpsert = true) => {
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
            activeViewId: viewId,
            // On page-load (skipUpsert=true), activeViewState is set later via setActiveViewState
            // once the views list loads. On user tab activation, set it immediately.
            activeViewState: !skipUpsert && viewId !== null ? mergedState : null,
            _skipUpsert: skipUpsert,
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Applies an updater function to activeState
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
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Sets activeState.filters directly
  setFilters: (slug, filters) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            activeState: { ...currentTable.activeState, filters },
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Sets activeState.search directly
  setSearch: (slug, search) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            activeState: { ...currentTable.activeState, search },
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Sets activeState.pagination directly
  setPagination: (slug, pagination) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            activeState: { ...currentTable.activeState, pagination },
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Sets activeViewState to the DB view's saved state — called once after views load on page reload
  setActiveViewState: (slug, viewState) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;
      return {
        tables: {
          ...prev.tables,
          [slug]: { ...currentTable, activeViewState: { ...EMPTY_TABLE_STATE, ...viewState } },
        },
      };
    });
  },

  // Reads _skipUpsert, clears it, and returns whether it was set — consumed once per load
  consumeSkipUpsert: (slug) => {
    const table = get().tables[slug];
    if (!table?._skipUpsert) return false;
    set((prev) => ({
      tables: { ...prev.tables, [slug]: { ...prev.tables[slug], _skipUpsert: false } },
    }));
    return true;
  },

  // Syncs activeViewState to current activeState after a view is saved in-place
  syncActiveViewState: (slug) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            activeViewState: currentTable.activeState,
          },
        },
      };
    });
  },
}));
