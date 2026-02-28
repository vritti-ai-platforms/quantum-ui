import type { Table } from '@tanstack/react-table';
import { Eye, EyeOff, GripVertical, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/shadcnPopover';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import { SortableItem, SortableList } from '../../Sortable';
import type { DataTableFilterItem, DataTableMeta } from '../types';

interface DataTableFiltersProps<TData> {
  filters: DataTableFilterItem[];
  table: Table<TData>;
}

// Filter row in the settings popover — drag to reorder, Eye/EyeOff to hide
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
  if (!metaRaw) return null;
  const meta: DataTableMeta = metaRaw;

  // Effective order: stored order (filtered to existing slugs) + any new filters appended at end
  const effectiveOrder = [
    ...meta.filterOrder.filter((slug) => filters.some((f) => f.slug === slug)),
    ...filters.filter((f) => !meta.filterOrder.includes(f.slug)).map((f) => f.slug),
  ];

  const visibleFilters = effectiveOrder
    .map((slug) => filters.find((f) => f.slug === slug))
    .filter((f): f is DataTableFilterItem => f !== undefined && meta.filterVisibility[f.slug] !== false);

  // Reorder stored order array, preserving any slugs not in the current filter set
  function handleReorder(reordered: { id: string }[]) {
    const reorderedSlugs = reordered.map((r) => r.id);
    const filterSet = new Set(filters.map((f) => f.slug));
    let idx = 0;
    const newOrder = effectiveOrder.map((slug) => (filterSet.has(slug) ? reorderedSlugs[idx++] : slug));
    meta.setFilterOrder(newOrder);
  }

  const sortableItems = effectiveOrder
    .map((slug) => {
      const filter = filters.find((f) => f.slug === slug);
      return filter ? { id: slug, filter } : null;
    })
    .filter((item): item is { id: string; filter: DataTableFilterItem } => item !== null);

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b flex-wrap">
      {visibleFilters.map((f) => (
        <span key={f.slug}>{f.node}</span>
      ))}

      {/* Settings popover — far right */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto h-8 w-8 p-0">
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
                      table.getColumn(id)?.setFilterValue(undefined);
                    }
                    meta.toggleFilterVisibility(id);
                  }}
                />
              ))}
            </SortableList>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

DataTableFilters.displayName = 'DataTableFilters';
