import type { Table } from '@tanstack/react-table';
import { Eye, EyeOff, GripVertical, Settings } from 'lucide-react';
import { isValidElement, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/shadcnPopover';
import { cn } from '../../../../shadcn/utils';
import type { FilterCondition } from '../../../types/table-filter';
import { Button } from '../../Button';
import { SortableItem, SortableList } from '../../Sortable';
import { useDataTableStore } from '../store/store';
import type { DataTableMeta } from '../types';
import { FilterWrapper } from './FilterWrapper';

type FilterFormValues = Record<string, FilterCondition | null | undefined>;

// Extracts id and label from a ReactNode's props
function getFilterProps(node: React.ReactNode): { id: string; label: string } | null {
  if (!isValidElement(node)) return null;
  const props = node.props as Record<string, unknown>;
  const id = typeof props.name === 'string' ? props.name : null;
  const label = typeof props.label === 'string' ? props.label : '';
  if (!id) return null;
  return { id, label };
}

interface DataTableFiltersProps<TData> {
  filters: React.ReactNode[];
  table: Table<TData>;
}

// Filter row in the settings popover -- drag to reorder, Eye/EyeOff to hide
function SortableFilterItem({
  filter,
  isVisible,
  onToggleVisibility,
}: {
  filter: { id: string; label: string };
  isVisible: boolean;
  onToggleVisibility: () => void;
}) {
  return (
    <SortableItem id={filter.id}>
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

// Stable fallback for selectors when slug is missing
const NO_FILTERS: FilterCondition[] = [];

// Renders the active filter bar with ordered/visible filters and a settings popover
export function DataTableFilters<TData>({ filters, table }: DataTableFiltersProps<TData>) {
  const metaRaw = table.options.meta as DataTableMeta | undefined;
  const slug = metaRaw?.slug ?? '';

  const activeFilters = useDataTableStore((s) => s.tables[slug]?.activeState?.filters ?? NO_FILTERS);
  const activeViewId = useDataTableStore((s) => s.tables[slug]?.activeViewId ?? null);

  // Build default values from active filters, keyed by view to reset form on view change
  const defaultValues = useMemo(
    () =>
      activeFilters.reduce<Record<string, FilterCondition>>((acc, f) => {
        acc[f.field] = f;
        return acc;
      }, {}),
    [activeFilters],
  );

  // Extract metadata from filter ReactNodes
  const filterEntries = useMemo(() => {
    const entries: { id: string; label: string; node: React.ReactNode }[] = [];
    for (const node of filters) {
      const props = getFilterProps(node);
      if (props) {
        entries.push({ ...props, node });
      }
    }
    return entries;
  }, [filters]);

  if (!metaRaw) return null;
  const meta = metaRaw;

  const filterMap = new Map(filterEntries.map((f) => [f.id, f]));

  // Effective order: stored order (filtered to existing ids) + any new filters appended at end
  const effectiveOrder = [
    ...meta.filterOrder.filter((s) => filterMap.has(s)),
    ...filterEntries.filter((f) => !meta.filterOrder.includes(f.id)).map((f) => f.id),
  ];

  const visibleFilters = effectiveOrder
    .map((s) => filterMap.get(s))
    .filter(
      (f): f is { id: string; label: string; node: React.ReactNode } =>
        f !== undefined && meta.filterVisibility[f.id] !== false,
    );

  function handleReorder(reordered: { id: string }[]) {
    meta.setFilterOrder(reordered.map((r) => r.id));
  }

  function handleApply(data: FilterFormValues) {
    const applied = Object.values(data).filter((c): c is FilterCondition => c != null);
    meta.setFilters(applied);
  }

  function handleReset() {
    meta.setFilters([]);
  }

  const hasActiveFilters = activeFilters.length > 0;
  const hiddenFilterCount = filterEntries.filter((f) => meta.filterVisibility[f.id] === false).length;

  const sortableItems = effectiveOrder
    .map((s) => {
      const filter = filterMap.get(s);
      return filter ? { id: s, label: filter.label } : null;
    })
    .filter((item): item is { id: string; label: string } => item !== null);

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b flex-wrap">
      <FilterWrapper
        key={activeViewId + JSON.stringify(defaultValues)}
        defaultValues={defaultValues}
        activeFilters={activeFilters}
        onSubmit={handleApply}
        onReset={handleReset}
        className="flex items-center gap-2 flex-1 flex-wrap"
        renderActions={({ isPending, isSubmitting }) => (
          <div className="flex items-center gap-2 ml-auto">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" type="reset">
                Reset
              </Button>
            )}
            {isPending && (
              <Button size="sm" type="submit" isLoading={isSubmitting}>
                Apply
              </Button>
            )}
          </div>
        )}
      >
        {visibleFilters.map((f) => (
          <span key={f.id}>{f.node}</span>
        ))}
      </FilterWrapper>

      {/* Settings popover — outside FilterWrapper */}
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
                {sortableItems.map(({ id, label }) => (
                  <SortableFilterItem
                    key={id}
                    filter={{ id, label }}
                    isVisible={meta.filterVisibility[id] !== false}
                    onToggleVisibility={() => meta.toggleFilterVisibility(id)}
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
