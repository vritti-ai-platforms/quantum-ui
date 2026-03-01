import { Check, Ellipsis, Globe, Lock, Pencil, Plus, Save, Share2, Trash2, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { cn } from '../../../shadcn/utils';
import type { TableViewState } from '../../types/table-filter';
import { Button } from '../Button';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { Spinner } from '../Spinner';

export interface TableView {
  id: string;
  name: string;
  state: TableViewState;
  isShared: boolean;
  isOwn: boolean;
}

export interface ViewTabsProps {
  defaultLabel?: string;
  views: TableView[];
  activeViewId: string | null;
  currentState: TableViewState;
  onActivate: (viewId: string | null) => void;
  onSave: (name: string) => void;
  onUpdate: (viewId: string) => void;
  onRename: (viewId: string, name: string) => void;
  onDelete: (viewId: string) => void;
  onToggleShare: (viewId: string, isShared: boolean) => void;
  isLoading?: boolean;
}

// Horizontal tab strip for switching between saved table views
export const ViewTabs: React.FC<ViewTabsProps> = ({
  defaultLabel = 'All',
  views,
  activeViewId,
  currentState: _currentState,
  onActivate,
  onSave,
  onUpdate,
  onRename,
  onDelete,
  onToggleShare,
  isLoading = false,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Starts the inline create flow
  const handleStartCreate = useCallback(() => {
    setIsCreating(true);
    setNewName('');
    requestAnimationFrame(() => newInputRef.current?.focus());
  }, []);

  // Saves a new view from the inline input
  const handleConfirmCreate = useCallback(() => {
    const trimmed = newName.trim();
    if (trimmed) {
      onSave(trimmed);
    }
    setIsCreating(false);
    setNewName('');
  }, [newName, onSave]);

  // Cancels the inline create flow
  const handleCancelCreate = useCallback(() => {
    setIsCreating(false);
    setNewName('');
  }, []);

  // Starts inline rename for a view
  const handleStartRename = useCallback((view: TableView) => {
    setEditingId(view.id);
    setEditingName(view.name);
    requestAnimationFrame(() => editInputRef.current?.focus());
  }, []);

  // Confirms the rename
  const handleConfirmRename = useCallback(() => {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  }, [editingId, editingName, onRename]);

  // Cancels the rename
  const handleCancelRename = useCallback(() => {
    setEditingId(null);
    setEditingName('');
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 border-b px-1 py-2">
        <Spinner className="size-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 border-b overflow-x-auto" role="tablist" aria-label="Table views">
      {/* Default "All" tab */}
      <button
        type="button"
        role="tab"
        aria-selected={activeViewId === null}
        className={cn(
          'shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap',
          activeViewId === null
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
        )}
        onClick={() => onActivate(null)}
      >
        {defaultLabel}
      </button>

      {/* Named view tabs */}
      {views.map((view) => (
        <div key={view.id} className="flex items-center shrink-0">
          {editingId === view.id ? (
            <div className="flex items-center gap-1 px-2 py-1.5">
              <input
                ref={editInputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmRename();
                  if (e.key === 'Escape') handleCancelRename();
                }}
                className="h-6 w-24 rounded border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
              />
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleConfirmRename}>
                <Check className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancelRename}>
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <button
                type="button"
                role="tab"
                aria-selected={activeViewId === view.id}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap',
                  activeViewId === view.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                )}
                onClick={() => onActivate(view.id)}
              >
                <span className="flex items-center gap-1.5">
                  {view.name}
                  {view.isShared && <Globe className="size-3 text-muted-foreground" />}
                  {!view.isOwn && <Lock className="size-3 text-muted-foreground" />}
                </span>
              </button>

              {/* Overflow menu */}
              <DropdownMenuRoot>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <Ellipsis className="size-3.5" />
                    <span className="sr-only">View options for {view.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[180px]">
                  {view.isOwn && (
                    <DropdownMenuItem onClick={() => handleStartRename(view)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit name
                    </DropdownMenuItem>
                  )}
                  {view.isOwn && (
                    <DropdownMenuItem onClick={() => onUpdate(view.id)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save changes
                    </DropdownMenuItem>
                  )}
                  {view.isOwn && (
                    <DropdownMenuItem onClick={() => onToggleShare(view.id, !view.isShared)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      {view.isShared ? 'Unshare' : 'Share'}
                    </DropdownMenuItem>
                  )}
                  {view.isOwn && <DropdownMenuSeparator />}
                  {view.isOwn && (
                    <DropdownMenuItem
                      onClick={() => onDelete(view.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                  {!view.isOwn && (
                    <DropdownMenuItem disabled>
                      <Lock className="mr-2 h-4 w-4" />
                      Shared by others
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenuRoot>
            </>
          )}
        </div>
      ))}

      {/* Create new view */}
      {isCreating ? (
        <div className="flex items-center gap-1 px-2 py-1.5 shrink-0">
          <input
            ref={newInputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirmCreate();
              if (e.key === 'Escape') handleCancelCreate();
            }}
            placeholder="View name..."
            className="h-6 w-28 rounded border border-input bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring"
          />
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleConfirmCreate}>
            <Check className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancelCreate}>
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={handleStartCreate}
          aria-label="Create new view"
        >
          <Plus className="size-4" />
        </Button>
      )}
    </div>
  );
};

ViewTabs.displayName = 'ViewTabs';
