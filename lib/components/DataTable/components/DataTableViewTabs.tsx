import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchViews, upsertTableState } from '../../../services/table-views.service';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';
import { Button } from '../../Button';
import { useDataTableStore } from '../store/store';
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
  const isViewDirty = useDataTableStore((s) => s.tables[tableSlug]?.isViewDirty ?? false);
  const loadViewState = useDataTableStore((s) => s.loadViewState);

  const upsertMut = useMutation({
    mutationFn: ({ state }: { state: typeof EMPTY_TABLE_STATE }) => upsertTableState(tableSlug, state),
    onSuccess: () => {
      config.onStateApplied?.();
    },
  });

  // Activates a view; clicking the already-active view clears state and deactivates
  function activate(viewId: string) {
    if (activeViewId === viewId) {
      loadViewState(tableSlug, EMPTY_TABLE_STATE, null);
      upsertMut.mutate({ state: EMPTY_TABLE_STATE });
    } else {
      const view = views.find((v) => v.id === viewId);
      if (view) {
        loadViewState(tableSlug, view.state, viewId);
        upsertMut.mutate({ state: view.state });
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
