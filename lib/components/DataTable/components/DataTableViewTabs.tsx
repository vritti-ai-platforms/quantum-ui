import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchViews } from '../../../services/table-views.service';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';
import { Button } from '../../Button';
import { useDataTableStore, viewStatesEqual } from '../store/store';
import type { DataTableViewsConfig } from '../types';

const VIEWS_QK = (slug: string) => ['quantum-ui', 'table-views', slug] as const;

// Renders horizontal pill-style tabs for named views only — no default "All" tab
export function DataTableViewTabs({ config }: { config: DataTableViewsConfig }) {
  const { tableSlug } = config;

  const { data: views = [] } = useQuery({
    queryKey: VIEWS_QK(tableSlug),
    queryFn: () => fetchViews(tableSlug),
  });

  const activeViewId = useDataTableStore((s) => s.tables[tableSlug]?.activeViewId ?? null);
  const loadViewState = useDataTableStore((s) => s.loadViewState);
  const setActiveViewState = useDataTableStore((s) => s.setActiveViewState);

  // On page reload, activeViewState is null until views load — set it once from the DB view
  useEffect(() => {
    if (!activeViewId || views.length === 0) return;
    const hasBaseline = useDataTableStore.getState().tables[tableSlug]?.activeViewState !== null;
    if (hasBaseline) return;
    const view = views.find((v) => v.id === activeViewId);
    if (view) setActiveViewState(tableSlug, view.state);
  }, [views, activeViewId, tableSlug, setActiveViewState]);

  // Dirty if activeState differs from the saved view state
  const isViewDirty = useDataTableStore((s) => {
    const t = s.tables[tableSlug];
    if (!t?.activeViewState) return false;
    return !viewStatesEqual(t.activeState, t.activeViewState);
  });

  // Activates a view; clicking the already-active view clears state and deactivates
  function activate(viewId: string) {
    if (activeViewId === viewId) {
      loadViewState(tableSlug, EMPTY_TABLE_STATE, null, false);
    } else {
      const view = views.find((v) => v.id === viewId);
      if (view) {
        loadViewState(tableSlug, view.state, viewId, false);
      }
    }
  }

  if (views.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto">
      {views.map((view) => (
        <Button
          key={view.id}
          variant={activeViewId === view.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => activate(view.id)}
          className="h-8 shrink-0 rounded-md px-3 text-sm whitespace-nowrap"
        >
          <span className="relative inline-flex items-center gap-1.5">
            {view.name}
            {isViewDirty && activeViewId === view.id && (
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
            )}
          </span>
        </Button>
      ))}
    </div>
  );
}

DataTableViewTabs.displayName = 'DataTableViewTabs';
