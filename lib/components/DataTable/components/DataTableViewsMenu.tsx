import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookmarkPlus, LayoutList, Pencil, Save, Settings2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { TableViewRecord } from '../../../services/table-views.service';
import { createView, deleteView, fetchViews, updateView } from '../../../services/table-views.service';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';
import { Button } from '../../Button';
import { Dialog } from '../../Dialog';
import { DropdownMenu, DropdownMenuItem } from '../../DropdownMenu';
import { TextField } from '../../TextField';
import { useDataTableStore } from '../store/store';
import type { DataTableViewsConfig } from '../types';

const VIEWS_QK = (slug: string) => ['quantum-ui', 'table-views', slug] as const;

// ─── Create View ─────────────────────────────────────────────────────────────

// Menu item + dialog that creates a named view from current table state
function CreateViewMenuItem({ tableSlug }: { tableSlug: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const loadViewState = useDataTableStore((s) => s.loadViewState);

  const mut = useMutation({
    mutationFn: createView,
    onSuccess: (view) => {
      qc.invalidateQueries({ queryKey: VIEWS_QK(tableSlug) });
      loadViewState(tableSlug, view.state, view.id);
      setOpen(false);
      setName('');
    },
  });

  return (
    <>
      <DropdownMenuItem onClick={() => { setName(''); setOpen(true); }}>
        <BookmarkPlus className="mr-2 h-4 w-4" />
        Create New View
      </DropdownMenuItem>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Create New View"
        description="Save the current filters and sort as a named view."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              disabled={!name.trim() || mut.isPending}
              onClick={() =>
                mut.mutate({
                  name: name.trim(),
                  tableSlug,
                  state: useDataTableStore.getState().tables[tableSlug]?.activeState ?? EMPTY_TABLE_STATE,
                })
              }
            >
              {mut.isPending ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <TextField
          name="viewName"
          label="View name"
          placeholder="e.g. High Region Providers"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Dialog>
    </>
  );
}

// ─── Save View ────────────────────────────────────────────────────────────────

// Menu item that saves current activeState to the active view, or opens create dialog when no view is loaded
function SaveViewMenuItem({ tableSlug }: { tableSlug: string }) {
  const qc = useQueryClient();
  const isViewDirty = useDataTableStore((s) => s.tables[tableSlug]?.isViewDirty ?? false);
  const activeViewId = useDataTableStore((s) => s.tables[tableSlug]?.activeViewId ?? null);
  const hasActiveFilters = useDataTableStore((s) => (s.tables[tableSlug]?.activeState?.filters?.length ?? 0) > 0);
  const markClean = useDataTableStore((s) => s.markClean);
  const loadViewState = useDataTableStore((s) => s.loadViewState);

  // Create dialog reused when no view is active but filters exist
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');

  const saveMut = useMutation({
    mutationFn: ({ id, state }: { id: string; state: typeof EMPTY_TABLE_STATE }) => updateView(id, { state }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VIEWS_QK(tableSlug) });
      markClean(tableSlug);
    },
  });

  const createMut = useMutation({
    mutationFn: createView,
    onSuccess: (view) => {
      qc.invalidateQueries({ queryKey: VIEWS_QK(tableSlug) });
      loadViewState(tableSlug, view.state, view.id);
      setCreateOpen(false);
      setCreateName('');
    },
  });

  const canSave = (activeViewId !== null && isViewDirty) || (activeViewId === null && hasActiveFilters);

  function handleClick() {
    if (activeViewId !== null && isViewDirty) {
      const state = useDataTableStore.getState().tables[tableSlug]?.activeState;
      if (state) saveMut.mutate({ id: activeViewId, state });
    } else if (activeViewId === null && hasActiveFilters) {
      setCreateName('');
      setCreateOpen(true);
    }
  }

  return (
    <>
      <DropdownMenuItem disabled={!canSave} onClick={handleClick}>
        <Save className="mr-2 h-4 w-4" />
        Save View
      </DropdownMenuItem>

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Save as New View"
        description="Save the current filters as a named view."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              disabled={!createName.trim() || createMut.isPending}
              onClick={() =>
                createMut.mutate({
                  name: createName.trim(),
                  tableSlug,
                  state: useDataTableStore.getState().tables[tableSlug]?.activeState ?? EMPTY_TABLE_STATE,
                })
              }
            >
              {createMut.isPending ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <TextField
          name="saveViewName"
          label="View name"
          placeholder="e.g. AWS Providers"
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
        />
      </Dialog>
    </>
  );
}

// ─── Rename View ──────────────────────────────────────────────────────────────

// Menu item + dialog that renames the currently active view
function RenameViewMenuItem({ tableSlug }: { tableSlug: string }) {
  const qc = useQueryClient();
  const activeViewId = useDataTableStore((s) => s.tables[tableSlug]?.activeViewId ?? null);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');

  const mut = useMutation({
    mutationFn: ({ id, name: n }: { id: string; name: string }) => updateView(id, { name: n }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VIEWS_QK(tableSlug) });
      setOpen(false);
    },
  });

  // Reads the view name from cache — DataTableViewTabs keeps the cache warm
  function handleClick() {
    if (!activeViewId) return;
    const cached = qc.getQueryData<TableViewRecord[]>(VIEWS_QK(tableSlug)) ?? [];
    const view = cached.find((v) => v.id === activeViewId);
    if (!view) return;
    setOriginalName(view.name ?? '');
    setName(view.name ?? '');
    setOpen(true);
  }

  return (
    <>
      <DropdownMenuItem disabled={activeViewId === null} onClick={handleClick}>
        <Pencil className="mr-2 h-4 w-4" />
        Rename View
      </DropdownMenuItem>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Rename View"
        description={`Change the name of "${originalName}".`}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              disabled={!name.trim() || mut.isPending}
              onClick={() => activeViewId && mut.mutate({ id: activeViewId, name: name.trim() })}
            >
              {mut.isPending ? 'Renaming...' : 'Rename'}
            </Button>
          </>
        }
      >
        <TextField
          name="renameName"
          label="View name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Dialog>
    </>
  );
}

// ─── Manage Views ─────────────────────────────────────────────────────────────

// Menu item + dialog that lists all views with delete buttons — owns the views query
function ManageViewsMenuItem({ tableSlug }: { tableSlug: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const activeViewId = useDataTableStore((s) => s.tables[tableSlug]?.activeViewId ?? null);
  const loadViewState = useDataTableStore((s) => s.loadViewState);

  const { data: views = [] } = useQuery({
    queryKey: VIEWS_QK(tableSlug),
    queryFn: () => fetchViews(tableSlug),
  });

  const deleteMut = useMutation({
    mutationFn: deleteView,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: VIEWS_QK(tableSlug) });
      if (activeViewId === id) loadViewState(tableSlug, EMPTY_TABLE_STATE, null);
    },
  });

  return (
    <>
      <DropdownMenuItem onClick={() => setOpen(true)}>
        <LayoutList className="mr-2 h-4 w-4" />
        Manage Views
      </DropdownMenuItem>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Manage Views"
        description="Delete saved views for this table."
        footer={<Button variant="outline" onClick={() => setOpen(false)}>Close</Button>}
      >
        <div className="flex flex-col gap-1 py-2 max-h-64 overflow-y-auto">
          {views.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No saved views yet.</p>
          )}
          {views.map((view) => (
            <div key={view.id} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/50">
              <span className="text-sm truncate">{view.name}</span>
              {view.isOwn && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => deleteMut.mutate(view.id)}
                  disabled={deleteMut.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Dialog>
    </>
  );
}

// ─── Dropdown shell ───────────────────────────────────────────────────────────

// Composes independent menu items — no mutations, no queries, no store subscriptions here
export function DataTableViewsMenu({ config }: { config: DataTableViewsConfig }) {
  const { tableSlug } = config;

  return (
    <DropdownMenu
      trigger={{
        children: (
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="View options">
            <Settings2 className="h-4 w-4" />
          </Button>
        ),
      }}
      contentClassName="w-[180px]"
      align="end"
      items={[
        { type: 'custom', id: 'create-view',  asMenuItem: false, render: <CreateViewMenuItem  tableSlug={tableSlug} /> },
        { type: 'separator' },
        { type: 'custom', id: 'save-view',    asMenuItem: false, render: <SaveViewMenuItem    tableSlug={tableSlug} /> },
        { type: 'custom', id: 'rename-view',  asMenuItem: false, render: <RenameViewMenuItem  tableSlug={tableSlug} /> },
        { type: 'separator' },
        { type: 'custom', id: 'manage-views', asMenuItem: false, render: <ManageViewsMenuItem tableSlug={tableSlug} /> },
      ]}
    />
  );
}

DataTableViewsMenu.displayName = 'DataTableViewsMenu';
