import type { Table } from '@tanstack/react-table';
import { Eye, EyeOff, GripVertical, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/shadcnPopover';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import { SortableItem, SortableList } from '../../Sortable';
import { useDataTableStore } from '../store/store';
import type { DataTableFilterItem, DataTableMeta } from '../types';

interface DataTableFiltersProps<TData> {
  filters: DataTableFilterItem[];
  table: Table<TData>;
}

// Filter row in the settings popover -- drag to reorder, Eye/EyeOff to hide
function SortableFilterItem({
  filter,
  isVisible,
  onToggleVisibility,
}: {
  filter: DataTableFilterItem;
  isVisible: boolean;
  onToggleVisibility: () => void;
}) {
  return (
    <SortableItem id={filter.slug}>
      {({ isDragging, dragHandleProps }) => (
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition-colors',
            isDragging && 'opacity-50 bg-accent/30',
          )}
        >
          <div
            ref={dragHandleProps.ref}
            className="flex items-center gap-2 min-w-0 cursor-grab active:cursor-grabbing"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm truncate">{filter.label}</span>
          </div>
          <button
            type="button"
            onClick={onToggleVisibility}
            className={cn('p-1 rounded-sm hover:bg-accent transition-colors', !isVisible && 'opacity-50')}
            aria-label={isVisible ? `Hide ${filter.label}` : `Show ${filter.label}`}
          >
            {isVisible ? (
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      )}
    </SortableItem>
  );
}

// Renders the active filter bar with ordered/visible filters and a settings popover
export function DataTableFilters<TData>({ filters, table }: DataTableFiltersProps<TData>) {
  const metaRaw = table.options.meta as DataTableMeta | undefined;
  const updatePendingFilter = useDataTableStore((s) => s.updatePendingFilter);

  if (!metaRaw) return null;
  const meta: DataTableMeta = metaRaw;
  const slug = meta.slug;

  const filterMap = new Map(filters.map((f) => [f.slug, f]));

  // Effective order: stored order (filtered to existing slugs) + any new filters appended at end
  const effectiveOrder = [
    ...meta.filterOrder.filter((s) => filterMap.has(s)),
    ...filters.filter((f) => !meta.filterOrder.includes(f.slug)).map((f) => f.slug),
  ];

  const visibleFilters = effectiveOrder
    .map((s) => filterMap.get(s))
    .filter((f): f is DataTableFilterItem => f !== undefined && meta.filterVisibility[f.slug] !== false);

  function handleReorder(reordered: { id: string }[]) {
    meta.setFilterOrder(reordered.map((r) => r.id));
  }

  const hiddenFilterCount = filters.filter((f) => meta.filterVisibility[f.slug] === false).length;

  const sortableItems = effectiveOrder
    .map((s) => {
      const filter = filterMap.get(s);
      return filter ? { id: s, filter } : null;
    })
    .filter((item): item is { id: string; filter: DataTableFilterItem } => item !== null);

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b flex-wrap">
      {visibleFilters.map((f) => (
        <span key={f.slug}>{f.node}</span>
      ))}

      {/* Apply/Reset buttons -- always available via store state */}
      <div className="flex items-center gap-2 ml-auto">
        {(meta.pendingFilters.length > 0 || meta.isFilterDirty) && (
          <Button variant="ghost" size="sm" onClick={() => meta.resetFilters()}>
            Reset
          </Button>
        )}
        <Button size="sm" onClick={() => meta.applyFilters()} disabled={!meta.isFilterDirty}>
          Apply
        </Button>
      </div>

      {/* Settings popover -- far right */}
      <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={hiddenFilterCount > 0 ? 'secondary' : 'outline'}
            size="sm"
            className={cn('h-8 w-8 p-0', hiddenFilterCount > 0 && 'border-transparent')}
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Filter settings</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[240px] p-0">
          <div className="px-3 py-3 border-b">
            <span className="text-sm font-medium">Filter Settings</span>
            <p className="text-xs text-muted-foreground mt-0.5">Drag to reorder or hide filters</p>
          </div>
          <div className="max-h-[300px] overflow-y-auto py-1">
            <SortableList items={sortableItems} onReorder={handleReorder}>
              {sortableItems.map(({ id, filter }) => (
                <SortableFilterItem
                  key={id}
                  filter={filter}
                  isVisible={meta.filterVisibility[id] !== false}
                  onToggleVisibility={() => {
                    const isCurrentlyVisible = meta.filterVisibility[id] !== false;
                    if (isCurrentlyVisible) {
                      updatePendingFilter(slug, id, undefined);
                    }
                    meta.toggleFilterVisibility(id);
                  }}
                />
              ))}
            </SortableList>
          </div>
        </PopoverContent>
      </Popover>
      {hiddenFilterCount > 0 && (
        <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-medium text-primary-foreground">
          {hiddenFilterCount}
        </span>
      )}
      </div>
    </div>
  );
}

DataTableFilters.displayName = 'DataTableFilters';
