import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookmarkPlus, LayoutList, Pencil, Save, Settings2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EMPTY_TABLE_STATE } from '../../../types/table-filter';
import { useDataTableStore } from '../store/store';
import {
  createView,
  deleteView,
  fetchViews,
  updateView,
} from '../../../services/table-views.service';
import { Button } from '../../Button';
import { Dialog } from '../../Dialog';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../DropdownMenu';
import { TextField } from '../../TextField';
import type { DataTableViewsConfig } from '../types';

// Builds the query key for view queries scoped to a table slug
const VIEWS_QK = (slug: string) => ['quantum-ui', 'table-views', slug] as const;

// Self-contained views management dropdown with create, save, rename, and delete
export function DataTableViewsMenu({ config }: { config: DataTableViewsConfig }) {
  const { tableSlug, onStateApplied } = config;

  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: VIEWS_QK(tableSlug) });

  // Fetch all named views for this table
  const { data: views = [] } = useQuery({
    queryKey: VIEWS_QK(tableSlug),
    queryFn: () => fetchViews(tableSlug),
  });

  // Read activeState and dirty flag from store
  const activeState = useDataTableStore((s) => s.tables[tableSlug]?.activeState);
  const isViewDirty = useDataTableStore((s) => s.tables[tableSlug]?.isViewDirty ?? false);
  const activeViewId = useDataTableStore((s) => s.tables[tableSlug]?.activeViewId ?? null);
  const loadViewState = useDataTableStore((s) => s.loadViewState);
  const markClean = useDataTableStore((s) => s.markClean);

  // Local UI state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameOpen, setRenameOpen] = useState(false);
  const [renamedName, setRenamedName] = useState('');
  const [manageOpen, setManageOpen] = useState(false);

  const activeView = views.find((v) => v.id === activeViewId) ?? null;
  const hasActiveView = activeViewId !== null && activeView !== null;

  // Create a new named view from the current table state
  const createMut = useMutation({
    mutationFn: createView,
    onSuccess: (view) => {
      invalidate();
      loadViewState(tableSlug, view.state, view.id);
      setCreateOpen(false);
      setNewName('');
    },
  });

  // Save the current table state to the active view
  const saveMut = useMutation({
    mutationFn: ({ id, state }: { id: string; state: typeof EMPTY_TABLE_STATE }) => updateView(id, { state }),
    onSuccess: () => {
      invalidate();
      markClean(tableSlug);
    },
  });

  // Rename the active view
  const renameMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateView(id, { name }),
    onSuccess: () => {
      invalidate();
      setRenameOpen(false);
    },
  });

  // Delete a view and reset to empty state if it was active
  const deleteMut = useMutation({
    mutationFn: deleteView,
    onSuccess: (_, id) => {
      invalidate();
      if (activeViewId === id) {
        loadViewState(tableSlug, EMPTY_TABLE_STATE, null);
      }
    },
  });

  // Determine if save should be enabled
  const canSave = (activeViewId !== null && isViewDirty) || (activeViewId === null && (activeState?.filters?.length ?? 0) > 0);

  // Handles the save action -- updates existing view or opens create dialog
  function handleSave() {
    if (activeViewId !== null && isViewDirty && activeState) {
      saveMut.mutate({ id: activeViewId, state: activeState });
    } else if (activeViewId === null) {
      setNewName('');
      setCreateOpen(true);
    }
  }

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="View options">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem
            onClick={() => {
              setNewName('');
              setCreateOpen(true);
            }}
          >
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Create New View
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={!canSave}
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" />
            Save View
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!hasActiveView}
            onClick={() => {
              if (hasActiveView && activeView) {
                setRenamedName(activeView.name);
                setRenameOpen(true);
              }
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Rename View
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setManageOpen(true)}>
            <LayoutList className="mr-2 h-4 w-4" />
            Manage Views
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>

      {/* Create New View Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create New View"
        description="Save the current filters and sort as a named view."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newName.trim() || createMut.isPending}
              onClick={() => createMut.mutate({ name: newName.trim(), tableSlug, state: activeState ?? EMPTY_TABLE_STATE })}
            >
              {createMut.isPending ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <TextField
          name="newViewName"
          label="View name"
          placeholder="e.g. High Region Providers"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </Dialog>

      {/* Rename View Dialog */}
      <Dialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename View"
        description={`Change the name of "${activeView?.name}".`}
        footer={
          <>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!renamedName.trim() || renameMut.isPending}
              onClick={() => activeViewId && renameMut.mutate({ id: activeViewId, name: renamedName.trim() })}
            >
              {renameMut.isPending ? 'Renaming...' : 'Rename'}
            </Button>
          </>
        }
      >
        <TextField
          name="renamedViewName"
          label="View name"
          value={renamedName}
          onChange={(e) => setRenamedName(e.target.value)}
        />
      </Dialog>

      {/* Manage Views Dialog */}
      <Dialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        title="Manage Views"
        description="Delete saved views for this table."
        footer={
          <Button variant="outline" onClick={() => setManageOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="flex flex-col gap-1 py-2 max-h-64 overflow-y-auto">
          {views.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No saved views yet.</p>
          )}
          {views.map((view) => (
            <div
              key={view.id}
              className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/50"
            >
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

DataTableViewsMenu.displayName = 'DataTableViewsMenu';
