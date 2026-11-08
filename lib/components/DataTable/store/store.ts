import { deepEqual } from 'fast-equals';
import { create } from 'zustand';
import type { FilterCondition, SearchState, TableViewState } from '../../../types/table-filter';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';

const MAX_TABLES = 20;

// Compares two view states for equality — used by all dirty-check selectors
export function viewStatesEqual(a: TableViewState, b: TableViewState): boolean {
  return deepEqual(a, b);
}

// Merges a stored state over EMPTY_TABLE_STATE
function normalizeViewState(raw: TableViewState): TableViewState {
  return { ...EMPTY_TABLE_STATE, ...raw };
}

// Replaces or removes one field's condition, keeping the order of the others; returns the same array when unchanged
function withCondition(conditions: FilterCondition[], field: string, condition: FilterCondition | null) {
  const index = conditions.findIndex((c) => c.field === field);
  if (condition === null) return index === -1 ? conditions : conditions.filter((_, i) => i !== index);
  if (index === -1) return [...conditions, condition];
  if (deepEqual(conditions[index], condition)) return conditions;
  return conditions.map((c, i) => (i === index ? condition : c));
}

export interface TableState {
  activeState: TableViewState;
  activeViewState: TableViewState | null;
  activeViewId: string | null;
  lastAccessed: number;
  // Counts the user's changes; each one asks for the state to be saved (loads from the server never do)
  saveRequest: number;
}

export interface TableSlice {
  tables: Record<string, TableState>;
  initTable: (slug: string, options?: { pinSelectColumn?: boolean }) => void;
  loadViewState: (slug: string, state: TableViewState, viewId: string | null, fromUser?: boolean) => void;
  updateActiveState: (slug: string, updater: (prev: TableViewState) => TableViewState) => void;
  setFilters: (slug: string, filters: FilterCondition[]) => void;
  setFilter: (slug: string, field: string, condition: FilterCondition | null) => void;
  setContext: (slug: string, field: string, condition: FilterCondition | null) => void;
  setSearch: (slug: string, search: SearchState) => void;
  setPagination: (slug: string, pagination: { limit: number; offset: number }) => void;
  setActiveViewState: (slug: string, viewState: TableViewState) => void;
  syncActiveViewState: (slug: string) => void;
}

const DEFAULT_TABLE_STATE: TableState = {
  activeState: EMPTY_TABLE_STATE,
  activeViewState: null,
  activeViewId: null,
  lastAccessed: 0,
  saveRequest: 0,
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

  // Sets activeState/viewId/viewState from a stored state. A page load (the default) only shows it; a view the user
  // switches to is also saved as the table's live state
  loadViewState: (slug, state, viewId, fromUser = false) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      const loaded = normalizeViewState(state);

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            activeState: loaded,
            activeViewId: viewId,
            // On page-load, activeViewState is set later via setActiveViewState; on user tab activation, set it immediately
            activeViewState: fromUser && viewId !== null ? loaded : null,
            saveRequest: fromUser ? currentTable.saveRequest + 1 : currentTable.saveRequest,
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
            saveRequest: currentTable.saveRequest + 1,
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Sets activeState.filters.panel and returns to the first page, since the old page may be past the new result count
  setFilters: (slug, filters) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            saveRequest: currentTable.saveRequest + 1,
            activeState: {
              ...currentTable.activeState,
              filters: { ...currentTable.activeState.filters, panel: filters },
              pagination: { ...currentTable.activeState.pagination, offset: 0 },
            },
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Replaces or removes one condition in filters.panel and returns to the first page
  setFilter: (slug, field, condition) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;
      const { filters, pagination } = currentTable.activeState;
      const panel = withCondition(filters.panel, field, condition);
      if (panel === filters.panel) return prev;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            saveRequest: currentTable.saveRequest + 1,
            activeState: {
              ...currentTable.activeState,
              filters: { ...filters, panel },
              pagination: { ...pagination, offset: 0 },
            },
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Replaces or removes one condition in filters.context and returns to the first page
  setContext: (slug, field, condition) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;
      const { filters, pagination } = currentTable.activeState;
      const context = withCondition(filters.context, field, condition);
      if (context === filters.context) return prev;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            saveRequest: currentTable.saveRequest + 1,
            activeState: {
              ...currentTable.activeState,
              filters: { ...filters, context },
              pagination: { ...pagination, offset: 0 },
            },
            lastAccessed: Date.now(),
          },
        },
      };
    });
  },

  // Sets activeState.search and returns to the first page, since the old page may be past the new result count
  setSearch: (slug, search) => {
    set((prev) => {
      const currentTable = prev.tables[slug];
      if (!currentTable) return prev;

      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            saveRequest: currentTable.saveRequest + 1,
            activeState: {
              ...currentTable.activeState,
              search,
              pagination: { ...currentTable.activeState.pagination, offset: 0 },
            },
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
            saveRequest: currentTable.saveRequest + 1,
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
      const state = normalizeViewState(viewState);
      return {
        tables: {
          ...prev.tables,
          [slug]: {
            ...currentTable,
            activeViewState: state,
          },
        },
      };
    });
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
