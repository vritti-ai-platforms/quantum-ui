import type { ColumnOrderState, Updater } from '@tanstack/react-table';
import { create } from 'zustand';

export interface TableState {
  columnOrder: ColumnOrderState;
}

export interface TableSlice {
  tables: Record<string, TableState>;
  onColumnOrderChange: (slug: string, updaterOrValue: Updater<ColumnOrderState>) => void;
}

// Zustand store for persisting per-table state (column order, etc.) across renders
export const useDataTableStore = create<TableSlice>((set, get) => ({
  tables: {},
  onColumnOrderChange: (slug, updaterOrValue) => {
    const currentState = get().tables[slug];
    if (!currentState?.columnOrder) return;

    const newColumnOrder =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(currentState.columnOrder)
        : updaterOrValue;

    set((state) => ({
      tables: {
        ...state.tables,
        [slug]: {
          ...state.tables[slug],
          columnOrder: newColumnOrder,
        },
      },
    }));
  },
}));
