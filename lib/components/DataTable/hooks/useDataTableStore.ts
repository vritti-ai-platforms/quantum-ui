import type {
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import { create } from 'zustand';

// State fields that useReactTable expects
export interface TableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  pagination: PaginationState;
  columnVisibility: VisibilityState;
  columnPinning: ColumnPinningState;
  rowSelection: RowSelectionState;
}

// Per-table slice: grouped state object + co-located setters
export interface TableSlice {
  state: TableState;
  setSorting: (updater: SortingState | ((prev: SortingState) => SortingState)) => void;
  setColumnFilters: (updater: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => void;
  setGlobalFilter: (updater: string | ((prev: string) => string)) => void;
  setPagination: (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  setColumnVisibility: (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => void;
  setColumnPinning: (updater: ColumnPinningState | ((prev: ColumnPinningState) => ColumnPinningState)) => void;
  setRowSelection: (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
}

interface TableStoreState {
  tables: Record<string, TableSlice>;
  initTable: (tableId: string, defaults: Partial<TableState>) => void;
  resetTable: (tableId: string) => void;
}

// Default state for a new table
const defaultState: TableState = {
  sorting: [],
  columnFilters: [],
  globalFilter: '',
  pagination: { pageIndex: 0, pageSize: 10 },
  columnVisibility: {},
  columnPinning: { left: [], right: [] },
  rowSelection: {},
};

// Global zustand store — persists table state across component unmounts
export const useDataTableStore = create<TableStoreState>((set, get) => ({
  tables: {},

  // Creates a table slice with state + setters (only if not already present)
  initTable: (tableId, defaults) => {
    if (get().tables[tableId]) return;

    // Resolves TanStack's Updater<T> pattern (value or function)
    const createSetter = <K extends keyof TableState>(field: K) => {
      return (updater: TableState[K] | ((prev: TableState[K]) => TableState[K])) => {
        set((store) => {
          const prev = store.tables[tableId]?.state[field];
          const next = typeof updater === 'function' ? (updater as (p: TableState[K]) => TableState[K])(prev) : updater;
          return {
            tables: {
              ...store.tables,
              [tableId]: {
                ...store.tables[tableId],
                state: { ...store.tables[tableId].state, [field]: next },
              },
            },
          };
        });
      };
    };

    const initialState: TableState = { ...defaultState, ...defaults };

    set((store) => ({
      tables: {
        ...store.tables,
        [tableId]: {
          state: initialState,
          setSorting: createSetter('sorting'),
          setColumnFilters: createSetter('columnFilters'),
          setGlobalFilter: createSetter('globalFilter'),
          setPagination: createSetter('pagination'),
          setColumnVisibility: createSetter('columnVisibility'),
          setColumnPinning: createSetter('columnPinning'),
          setRowSelection: createSetter('rowSelection'),
        },
      },
    }));
  },

  // Removes a table's state entirely
  resetTable: (tableId) => {
    set((store) => {
      const { [tableId]: _, ...rest } = store.tables;
      return { tables: rest };
    });
  },
}));
