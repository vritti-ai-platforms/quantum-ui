import { useMutation, useQuery } from '@tanstack/react-query';
import { cn } from '../../../../shadcn/utils';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';
import { fetchViews, upsertTableState } from '../../../services/table-views.service';
import { useDataTableStore } from '../store/store';
import { Button } from '../../Button';
import type { DataTableViewsConfig } from '../types';

const VIEWS_QK = (slug: string) => ['quantum-ui', 'table-views', slug] as const;

// Renders horizontal pill-style tabs for named views only — no default "All" tab
export function DataTableViewTabs({ config }: { config: DataTableViewsConfig }) {
  const { tableSlug, onStateApplied } = config;

  const { data: views = [] } = useQuery({
    queryKey: VIEWS_QK(tableSlug),
    queryFn: () => fetchViews(tableSlug),
  });

  const activeViewId = useDataTableStore((s) => s.tables[tableSlug]?.activeViewId ?? null);
  const isViewDirty = useDataTableStore((s) => s.tables[tableSlug]?.isViewDirty ?? false);
  const loadViewState = useDataTableStore((s) => s.loadViewState);

  // Upserts state to backend then notifies the page to invalidate its query
  const upsertMut = useMutation({
    mutationFn: (state: typeof EMPTY_TABLE_STATE) => upsertTableState(tableSlug, state),
    onSuccess: () => onStateApplied?.(),
  });

  // Activates a view; clicking the already-active view clears state and deactivates
  function activate(viewId: string) {
    if (activeViewId === viewId) {
      // Deactivate — reset to empty and post to backend
      loadViewState(tableSlug, EMPTY_TABLE_STATE, null);
      upsertMut.mutate(EMPTY_TABLE_STATE);
    } else {
      const view = views.find((v) => v.id === viewId);
      if (view) loadViewState(tableSlug, view.state, viewId);
      // The auto-upsert in useDataTable handles the backend write for normal activation
    }
  }

  if (views.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto">
      {views.map((view) => (
        <Button
          key={view.id}
          variant="ghost"
          size="sm"
          onClick={() => activate(view.id)}
          className={cn(
            'h-8 shrink-0 rounded-lg px-3 text-sm font-medium transition-colors whitespace-nowrap',
            activeViewId === view.id
              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
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
