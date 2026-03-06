import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchViews, updateView } from '../../../services/table-views.service';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';
import { Button } from '../../Button';
import { Dialog } from '../../Dialog';
import { useDialog } from '../../../hooks/useDialog';
import { useDataTableStore, viewStatesEqual } from '../store/store';
import { CreateViewDialog } from './DataTableViewsMenu';

const VIEWS_QK = (slug: string) => ['quantum-ui', 'table-views', slug] as const;

// Renders horizontal pill-style tabs for named views only — no default "All" tab
export function DataTableViewTabs({ slug }: { slug: string }) {
  const tableSlug = slug;

  const { data: views = [] } = useQuery({
    queryKey: VIEWS_QK(tableSlug),
    queryFn: () => fetchViews(tableSlug),
  });

  const activeViewId = useDataTableStore((s) => s.tables[tableSlug]?.activeViewId ?? null);
  const loadViewState = useDataTableStore((s) => s.loadViewState);
  const setActiveViewState = useDataTableStore((s) => s.setActiveViewState);
  const syncActiveViewState = useDataTableStore((s) => s.syncActiveViewState);

  const [pendingViewId, setPendingViewId] = useState<string | null>(null);
  const dirtyGuard = useDialog();
  const createDialog = useDialog();

  const qc = useQueryClient();

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

  const saveMut = useMutation({
    mutationFn: ({ id, state }: { id: string; state: typeof EMPTY_TABLE_STATE }) =>
      updateView(id, state),
    onSuccess: () => {
      syncActiveViewState(tableSlug);
      qc.invalidateQueries({ queryKey: VIEWS_QK(tableSlug) });
      proceedWithSwitch();
    },
  });

  // Executes the actual view switch without dirty check
  function doActivate(viewId: string) {
    if (activeViewId === viewId) {
      loadViewState(tableSlug, EMPTY_TABLE_STATE, null, false);
    } else {
      const view = views.find((v) => v.id === viewId);
      if (view) loadViewState(tableSlug, view.state, viewId, false);
    }
  }

  // Proceeds with the pending view switch after a guard action
  function proceedWithSwitch() {
    const target = pendingViewId;
    dirtyGuard.close();
    setPendingViewId(null);
    if (target !== null) doActivate(target);
  }

  // Intercepts when view is dirty; otherwise switches immediately
  function activate(viewId: string) {
    if (isViewDirty) {
      setPendingViewId(viewId);
      dirtyGuard.open();
      return;
    }
    doActivate(viewId);
  }

  if (views.length === 0) return null;

  return (
    <>
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

      <Dialog
        open={dirtyGuard.isOpen}
        onOpenChange={(v) => {
          if (!v) {
            dirtyGuard.close();
            setPendingViewId(null);
          }
        }}
        title="Unsaved Changes"
        description="This view has unsaved changes. What would you like to do?"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              onClick={() => {
                dirtyGuard.close();
                createDialog.open();
              }}
            >
              Create New View
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const target = pendingViewId;
                dirtyGuard.close();
                setPendingViewId(null);
                if (target !== null) doActivate(target);
              }}
            >
              Discard
            </Button>
            <Button
              isLoading={saveMut.isPending}
              onClick={() => {
                const state = useDataTableStore.getState().tables[tableSlug]?.activeState;
                if (activeViewId && state) saveMut.mutate({ id: activeViewId, state });
              }}
            >
              Save View
            </Button>
          </div>
        }
      />

      <CreateViewDialog
        tableSlug={tableSlug}
        open={createDialog.isOpen}
        onClose={() => {
          createDialog.close();
          setPendingViewId(null);
        }}
      />
    </>
  );
}

DataTableViewTabs.displayName = 'DataTableViewTabs';
