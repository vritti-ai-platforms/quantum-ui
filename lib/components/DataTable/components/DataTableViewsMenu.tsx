import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookmarkPlus, EyeOff, LayoutList, Pencil, Save, Settings2, Share2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { TableViewRecord } from '../../../services/table-views.service';
import { createView, deleteView, fetchViews, renameView, toggleShareView, updateView } from '../../../services/table-views.service';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';
import { Button } from '../../Button';
import { Dialog } from '../../Dialog';
import { DropdownMenu } from '../../DropdownMenu';
import { TextField } from '../../TextField';
import { useDataTableStore } from '../store/store';
import type { DataTableViewsConfig } from '../types';

const VIEWS_QK = (slug: string) => ['quantum-ui', 'table-views', slug] as const;

const viewNameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

type ViewNameForm = z.infer<typeof viewNameSchema>;

type ViewDialog = 'create' | 'rename' | 'manage';

interface DialogComponentProps {
  tableSlug: string;
  open: boolean;
  onClose: () => void;
}

// ─── Create View Dialog ──────────────────────────────────────────────────────

// Dialog that creates a named view from current table state
function CreateViewDialog({ tableSlug, open, onClose }: DialogComponentProps) {
  const qc = useQueryClient();
  const loadViewState = useDataTableStore((s) => s.loadViewState);
  const form = useForm<ViewNameForm>({ resolver: zodResolver(viewNameSchema), defaultValues: { name: '' } });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const mut = useMutation({
    mutationFn: createView,
    onSuccess: (view) => {
      qc.invalidateQueries({ queryKey: VIEWS_QK(tableSlug) });
      loadViewState(tableSlug, view.state, view.id);
      onClose();
    },
  });

  return (
    <Dialog
      mode="form"
      open={open}
      onOpenChange={(v) => { if (!v) onClose(); }}
      title="Create New View"
      description="Save the current filters and sort as a named view."
      form={form}
      mutation={mut}
      transformSubmit={(data) => ({
        name: data.name.trim(),
        tableSlug,
        state: useDataTableStore.getState().tables[tableSlug]?.activeState ?? EMPTY_TABLE_STATE,
      })}
      submitLabel="Save"
    >
      <TextField name="name" label="View name" placeholder="e.g. High Region Providers" />
    </Dialog>
  );
}

// ─── Rename View Dialog ──────────────────────────────────────────────────────

interface RenameDialogProps extends DialogComponentProps {
  initialName: string;
}

// Dialog that renames the currently active view
function RenameViewDialog({ tableSlug, open, onClose, initialName }: RenameDialogProps) {
  const qc = useQueryClient();
  const activeViewId = useDataTableStore((s) => s.tables[tableSlug]?.activeViewId ?? null);
  const form = useForm<ViewNameForm>({ resolver: zodResolver(viewNameSchema), defaultValues: { name: '' } });

  // Reset form with initial name when dialog opens
  useEffect(() => {
    if (open) form.reset({ name: initialName });
  }, [open, initialName, form]);

  const mut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameView(id, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VIEWS_QK(tableSlug) });
      onClose();
    },
  });

  return (
    <Dialog
      mode="form"
      open={open}
      onOpenChange={(v) => { if (!v) onClose(); }}
      title="Rename View"
      description={`Change the name of "${initialName}".`}
      form={form}
      mutation={mut}
      transformSubmit={(data) => ({
        id: activeViewId ?? '',
        name: data.name.trim(),
      })}
      submitLabel="Rename"
    >
      <TextField name="name" label="View name" />
    </Dialog>
  );
}

// ─── Manage Views Dialog ─────────────────────────────────────────────────────

// Dialog that lists all views with delete buttons
function ManageViewsDialog({ tableSlug, open, onClose }: DialogComponentProps) {
  const qc = useQueryClient();
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

  const shareMut = useMutation({
    mutationFn: ({ id, isShared }: { id: string; isShared: boolean }) => toggleShareView(id, isShared),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VIEWS_QK(tableSlug) });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { if (!v) onClose(); }}
      title="Manage Views"
      description="Share or delete saved views for this table."
      footer={<Button variant="outline" onClick={onClose}>Close</Button>}
    >
      <div className="flex flex-col gap-1 py-2 max-h-64 overflow-y-auto">
        {views.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No saved views yet.</p>
        )}
        {views.map((view) => (
          <div key={view.id} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/50">
            <span className="text-sm truncate">{view.name}</span>
            {view.isOwn && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  title={view.isShared ? 'Make private' : 'Share with everyone'}
                  onClick={() => shareMut.mutate({ id: view.id, isShared: !view.isShared })}
                  disabled={shareMut.isPending}
                >
                  {view.isShared ? <EyeOff className="size-4" /> : <Share2 className="size-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => deleteMut.mutate(view.id)}
                  disabled={deleteMut.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Dialog>
  );
}

// ─── Dropdown shell ───────────────────────────────────────────────────────────

// Composes the dropdown menu with dialogs rendered outside the dropdown tree
export function DataTableViewsMenu({ config }: { config: DataTableViewsConfig }) {
  const { tableSlug } = config;
  const [activeDialog, setActiveDialog] = useState<ViewDialog | null>(null);
  const [renameInitialName, setRenameInitialName] = useState('');

  const qc = useQueryClient();
  const isViewDirty = useDataTableStore((s) => s.tables[tableSlug]?.isViewDirty ?? false);
  const activeViewId = useDataTableStore((s) => s.tables[tableSlug]?.activeViewId ?? null);
  const hasNonEmptyState = useDataTableStore((s) => {
    const st = s.tables[tableSlug]?.activeState;
    if (!st) return false;
    return (
      st.filters.length > 0 ||
      st.sort.length > 0 ||
      Object.keys(st.columnVisibility).length > 0 ||
      st.density !== 'normal' ||
      st.columnPinning.left.filter((c) => c !== 'select').length > 0 ||
      st.columnPinning.right.length > 0
    );
  });
  const markClean = useDataTableStore((s) => s.markClean);

  const hasView = activeViewId !== null;
  const showSave = hasView;
  const canSave = hasView && isViewDirty;
  const showCreate = hasView ? isViewDirty : true;
  const canCreate = hasView ? isViewDirty : hasNonEmptyState;

  // Save-in-place mutation (no dialog needed)
  const saveMut = useMutation({
    mutationFn: ({ id, state }: { id: string; state: typeof EMPTY_TABLE_STATE }) => updateView(id, state),
    onSuccess: () => {
      markClean(tableSlug);
    },
  });

  // Saves current state in place on the active view
  function handleSaveClick() {
    if (!activeViewId || !isViewDirty) return;
    const state = useDataTableStore.getState().tables[tableSlug]?.activeState;
    if (state) saveMut.mutate({ id: activeViewId, state });
  }

  // Reads the active view name from cache for the rename dialog
  function handleRenameClick() {
    if (!activeViewId) return;
    const cached = qc.getQueryData<TableViewRecord[]>(VIEWS_QK(tableSlug)) ?? [];
    const view = cached.find((v) => v.id === activeViewId);
    if (!view) return;
    setRenameInitialName(view.name ?? '');
    setActiveDialog('rename');
  }

  const close = () => setActiveDialog(null);

  return (
    <>
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
          ...(showSave
            ? [{ type: 'item' as const, id: 'save-view', label: 'Save View', icon: Save,
                 disabled: !canSave, onClick: handleSaveClick }]
            : []),
          ...(showCreate
            ? [{ type: 'item' as const, id: 'create-view', label: 'Create New View', icon: BookmarkPlus,
                 disabled: !canCreate, onClick: () => setActiveDialog('create' as ViewDialog) }]
            : []),
          { type: 'separator' },
          { type: 'item', id: 'rename-view', label: 'Rename View', icon: Pencil,
            disabled: !hasView, onClick: handleRenameClick },
          { type: 'separator' },
          { type: 'item', id: 'manage-views', label: 'Manage Views', icon: LayoutList,
            onClick: () => setActiveDialog('manage') },
        ]}
      />
      <CreateViewDialog tableSlug={tableSlug} open={activeDialog === 'create'} onClose={close} />
      <RenameViewDialog tableSlug={tableSlug} open={activeDialog === 'rename'} onClose={close} initialName={renameInitialName} />
      <ManageViewsDialog tableSlug={tableSlug} open={activeDialog === 'manage'} onClose={close} />
    </>
  );
}

DataTableViewsMenu.displayName = 'DataTableViewsMenu';
