import { useMutation } from '@tanstack/react-query';
import { type Column, flexRender } from '@tanstack/react-table';
import { ArrowDownToLine, ArrowUpFromLine, Funnel, TableProperties } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Separator } from '../../../shadcn/shadcnSeparator';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shadcn/shadcnTable';
import { cn } from '../../../shadcn/utils';
import { useDialog } from '../../hooks/useDialog';
import type { FilterCondition } from '../../types/conditions';
import { EMPTY_TABLE_STATE } from '../../types/table-state';
import { axios } from '../../utils/axios';
import { Button } from '../Button';
import { DropdownMenu } from '../DropdownMenu';
import { lockedTip, PermissionLockIcon, usePermission } from '../PermissionGate';
import { Skeleton } from '../Skeleton';
import { bindFilters } from './components/bindFilters';
import { DataTableColumnHeader } from './components/DataTableColumnHeader';
import { DataTableEmpty } from './components/DataTableEmpty';
import { DataTableFilters } from './components/DataTableFilters';
import { DataTableImportDialog } from './components/DataTableImportDialog';
import { DataTableLoadFailed, DataTableRefreshFailed } from './components/DataTableLoadStates';
import { DataTablePagination } from './components/DataTablePagination';
import { DataTableRowDensity } from './components/DataTableRowDensity';
import { DataTableSearch } from './components/DataTableSearch';
import { DataTableSelectionBar } from './components/DataTableSelectionBar';
import { DataTableViewOptions } from './components/DataTableViewOptions';
import { DataTableViewsMenu } from './components/DataTableViewsMenu';
import { DataTableViewTabs } from './components/DataTableViewTabs';
import { useDataTableStore } from './store/store';
import type { DataTableProps, DensityType, SearchState } from './types';
import { downloadBlob } from './utils';

const densityClasses: Record<DensityType, string> = {
  compact: 'py-1 px-2 text-xs',
  normal: 'py-2 px-3 text-sm',
  comfortable: 'py-4 px-3 text-sm',
};

const NO_FILTERS: FilterCondition[] = [];

const MODE_HEIGHTS = {
  page: 'calc(100vh - 280px)',
  tab: 'calc(100vh - 320px)',
  compact: 'calc(100vh - 570px)',
};

// Builds "No results match your search, your filters and this view." from the active flags
// Whether a column, or a column in its group, takes the width the others leave instead of a fixed width
function grows<TData>(column: Column<TData, unknown>): boolean {
  return column.getLeafColumns().some((leaf) => leaf.columnDef.meta?.grow === true);
}

// Where a column sits in its column group, by the group's visible columns; an ungrouped column is in none
function groupEdges<TData>(column: Column<TData, unknown>): { inGroup: boolean; isFirst: boolean; isLast: boolean } {
  const leaves = column.parent?.getLeafColumns().filter((leaf) => leaf.getIsVisible()) ?? [];
  if (leaves.length === 0) return { inGroup: false, isFirst: false, isLast: false };
  return { inGroup: true, isFirst: leaves[0].id === column.id, isLast: leaves[leaves.length - 1].id === column.id };
}

// A group's label set in a rule whose ends drop onto the first and last columns it spans: ┌── QUANTITY ──┐
function GroupBracket({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-end gap-2 px-2">
      <span aria-hidden className="h-2 min-w-1 flex-1 rounded-tl-sm border-t border-l border-primary/50" />
      <span className="min-w-0 truncate pb-0.5 text-xs leading-none font-semibold tracking-wider text-primary uppercase">
        {children}
      </span>
      <span aria-hidden className="h-2 min-w-1 flex-1 rounded-tr-sm border-t border-r border-primary/50" />
    </div>
  );
}

function buildNoResultsDescription(flags: {
  hasActiveSearch: boolean;
  hasActiveFilters: boolean;
  hasActiveView: boolean;
}): string {
  const parts: string[] = [];
  if (flags.hasActiveSearch) parts.push('your search');
  if (flags.hasActiveFilters) parts.push('your filters');
  if (flags.hasActiveView) parts.push('this view');
  const joined = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  return `No results match ${joined}.`;
}

// Renders a full-featured data table from a raw TanStack Table instance
export function DataTable<TData>({
  table: instance,
  searchConfig,
  selectActions,
  emptyStateConfig,
  toolbarActions,
  filters,
  contextBar,
  className,
  enableViews = true,
  importExport,
  mode = 'page',
  onRowClick,
  selectedRowId,
  permission,
}: DataTableProps<TData>) {
  const { table, isLoading: isLoadingProp, isFetching, isSyncing, isError, error, refetch } = instance;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const importDialog = useDialog();

  // Header and body are separate scroll regions so the vertical scrollbar starts BELOW the header
  // (only the body scrolls vertically). Horizontal scroll lives on the body; we mirror its scrollLeft
  // onto the header so both table-fixed layouts stay pixel-aligned without a shared scroll context.
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const syncHeaderScroll = () => {
    if (headerScrollRef.current && bodyScrollRef.current) {
      headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
    }
  };
  // The header scrolls on its own when a title it clips takes focus (a click, a Tab); the body follows it
  const syncBodyScroll = () => {
    if (headerScrollRef.current && bodyScrollRef.current) {
      bodyScrollRef.current.scrollLeft = headerScrollRef.current.scrollLeft;
    }
  };

  // Table-level + import/export gates — ALLOW when no code or no provider is mounted
  const tableGate = usePermission(permission);
  const importGate = usePermission(importExport?.importPermission);
  const exportGate = usePermission(importExport?.exportPermission);

  const meta = table.options.meta;
  const slug = meta?.slug;
  const panelFilters = useDataTableStore((s) => (slug ? s.tables[slug]?.activeState?.filters.panel : undefined));
  const contextFilters = useDataTableStore((s) => (slug ? s.tables[slug]?.activeState?.filters.context : undefined));
  const appliedFilterCount = panelFilters?.length ?? 0;
  const activeViewId = useDataTableStore((s) => (slug ? (s.tables[slug]?.activeViewId ?? null) : null));
  const hasRows = table.getRowModel().rows.length > 0;
  // Rows fetched before the page's defaults were filled never show: the skeleton stays until that refetch lands. A
  // change to a table showing nothing loads like a first fetch, so its "no results" doesn't stand in for the answer.
  const isLoading = isLoadingProp || !!meta?.isAwaitingDefaults || (isSyncing && !hasRows && !isError);
  const loadViewState = useDataTableStore((s) => s.loadViewState);
  const density = meta?.density ?? 'normal';
  // Leaf columns, so a grouped header's columns each get a skeleton cell and hidden ones get none
  const columnCount = table.getVisibleLeafColumns().length;
  // Each visible column's own width for both tables: a fixed-layout table otherwise sizes its columns from its first row,
  // which under grouped headers is the group row and splits a group's width evenly across the columns it spans
  const columnWidths = (
    <colgroup>
      {table.getVisibleLeafColumns().map((column) => (
        <col
          key={column.id}
          style={{ width: column.id === 'actions' ? 70 : grows(column) ? undefined : column.getSize() }}
        />
      ))}
    </colgroup>
  );
  const visibilityEnabled = table.options.enableHiding !== false;
  // Import/Export respect their gates: hidden when not granted, disabled (with lock) when locked
  const showImport = !!importExport?.importEndpoint && importGate.granted;
  const showExport = !!importExport?.exportEndpoint && exportGate.granted;
  const showToolbar =
    searchConfig ||
    visibilityEnabled ||
    toolbarActions ||
    filters ||
    contextBar ||
    (enableViews && slug) ||
    showImport ||
    showExport;

  const search = meta?.search ?? null;
  const hasActiveView = !!activeViewId;
  // Without a view, "active" = anything present. With a view, "active" = diverged from the view's saved state.
  const hasActiveFilters = hasActiveView ? !!meta?.isFiltersDirty : appliedFilterCount > 0;
  const hasActiveSearch = hasActiveView ? !!meta?.isSearchDirty : !!(search?.value && search.value.trim() !== '');
  const isFiltered = hasActiveSearch || hasActiveFilters || hasActiveView;
  // Reset baselines: clear actions revert to the view's saved values, or to empty when no view is active.
  const filtersBaseline = meta?.activeViewState?.filters.panel ?? NO_FILTERS;
  const searchBaseline = meta?.activeViewState?.search ?? null;
  const onSearchChange = (s: SearchState) => meta?.setSearch?.(s);

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  // Named context controls are filters kept in filters.context; one with a default can't be cleared
  const setContext = meta?.setContext;
  const defaultContext = meta?.defaultContext ?? NO_FILTERS;
  const requiredContext = useMemo(() => new Set(defaultContext.map((c) => c.field)), [defaultContext]);
  const boundContextBar =
    contextBar && setContext
      ? bindFilters(contextBar, {
          conditions: contextFilters ?? NO_FILTERS,
          onChange: setContext,
          keepControlled: true,
          required: requiredContext,
          // After a failed first load the controls show what the table holds rather than waiting on a load that ended
          loading: !meta?.isLoaded && !isError,
        })
      : contextBar;

  // Auto-close filters when rows are selected
  useEffect(() => {
    if (selectedCount > 0) setFiltersOpen(false);
  }, [selectedCount]);

  const exportMutation = useMutation({
    mutationFn: async (format: string) => {
      if (!importExport?.exportEndpoint) return;
      const response = await axios.get(`${importExport.exportEndpoint}/${format}`, {
        responseType: 'blob',
        showSuccessToast: false,
      });
      downloadBlob(response.data, `${importExport.filename}.${format}`);
    },
  });

  // render = role: the role doesn't grant this table's feature, so it doesn't exist for this user
  if (!tableGate.granted) {
    return null;
  }

  // Locked keeps the table shell but shows a lock empty-state and disables filters instead of data
  const locked = tableGate.locked;

  // What the table shows when it has no rows to show: a lock, a failed load, no matches for the filters, or nothing yet
  function renderNoRows() {
    if (locked) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <PermissionLockIcon reason={tableGate.reason} className="size-6" />
          <p className="text-sm text-muted-foreground">{lockedTip(tableGate)}</p>
        </div>
      );
    }
    if (isError) {
      return <DataTableLoadFailed plural={meta?.plural ?? 'rows'} error={error} refetch={refetch} />;
    }
    if (isFiltered) {
      return (
        <DataTableEmpty
          icon={emptyStateConfig?.icon}
          title="No results found"
          description={buildNoResultsDescription({ hasActiveSearch, hasActiveFilters, hasActiveView })}
          action={
            <div className="flex gap-2">
              {hasActiveSearch && (
                <Button variant="outline" size="sm" onClick={() => meta?.setSearch?.(searchBaseline)}>
                  Clear Search
                </Button>
              )}
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={() => meta?.setFilters?.(filtersBaseline)}>
                  Clear Filters
                </Button>
              )}
              {hasActiveView && slug && (
                <Button variant="outline" size="sm" onClick={() => loadViewState(slug, EMPTY_TABLE_STATE, null, true)}>
                  Clear View
                </Button>
              )}
            </div>
          }
        />
      );
    }
    return (
      <DataTableEmpty
        icon={emptyStateConfig?.icon}
        title={emptyStateConfig?.title}
        description={emptyStateConfig?.description}
        action={emptyStateConfig?.action}
      />
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center gap-4">
          {/* LEFT: the context bar, then view tabs (flex-1) when views are on; otherwise spacer */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {contextBar && (
              <>
                <div className="flex shrink-0 items-center gap-2">{boundContextBar}</div>
                <Separator orientation="vertical" className="data-[orientation=vertical]:h-6" />
              </>
            )}
            <div className="flex min-w-0 flex-1">{enableViews && slug && <DataTableViewTabs slug={slug} />}</div>
          </div>

          {/* RIGHT: icon buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {searchConfig && (
              <DataTableSearch
                columns={searchConfig.columns}
                searchAll={searchConfig.searchAll}
                search={search}
                onSearchChange={onSearchChange}
              />
            )}
            {filters && (
              <div className="relative">
                <Button
                  variant={filtersOpen || appliedFilterCount > 0 ? 'secondary' : 'outline'}
                  size="sm"
                  className={cn('h-8 w-8 p-0', (filtersOpen || appliedFilterCount > 0) && 'border border-transparent')}
                  onClick={() => setFiltersOpen((v) => !v)}
                  disabled={locked}
                  aria-label="Toggle filters"
                >
                  <Funnel className="h-4 w-4" />
                </Button>
                {appliedFilterCount > 0 && (
                  <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-medium text-primary-foreground">
                    {appliedFilterCount}
                  </span>
                )}
              </div>
            )}
            {visibilityEnabled && <DataTableViewOptions table={table} />}
            <DataTableRowDensity table={table as import('@tanstack/react-table').Table<unknown>} />
            {enableViews && slug && <DataTableViewsMenu slug={slug} />}
            {(showImport || showExport) && (
              <DropdownMenu
                trigger={{
                  children: (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Import / Export">
                      <TableProperties className="h-4 w-4" />
                    </Button>
                  ),
                }}
                items={[
                  ...(showImport
                    ? [
                        {
                          type: 'item' as const,
                          id: 'import',
                          label: 'Import',
                          icon: ArrowUpFromLine,
                          disabled: importGate.locked,
                          onClick: importDialog.open,
                        },
                      ]
                    : []),
                  ...(showExport
                    ? [
                        {
                          type: 'sub' as const,
                          id: 'export',
                          label: 'Export All',
                          icon: ArrowDownToLine,
                          items: [
                            {
                              type: 'item' as const,
                              id: 'csv',
                              label: 'CSV (.csv)',
                              disabled: exportMutation.isPending || exportGate.locked,
                              onClick: () => exportMutation.mutate('csv'),
                            },
                            {
                              type: 'item' as const,
                              id: 'xlsx',
                              label: 'Excel (.xlsx)',
                              disabled: exportMutation.isPending || exportGate.locked,
                              onClick: () => exportMutation.mutate('xlsx'),
                            },
                            {
                              type: 'item' as const,
                              id: 'xls',
                              label: 'Excel 97-2004 (.xls)',
                              disabled: exportMutation.isPending || exportGate.locked,
                              onClick: () => exportMutation.mutate('xls'),
                            },
                            {
                              type: 'item' as const,
                              id: 'ods',
                              label: 'OpenDocument (.ods)',
                              disabled: exportMutation.isPending || exportGate.locked,
                              onClick: () => exportMutation.mutate('ods'),
                            },
                            {
                              type: 'item' as const,
                              id: 'tsv',
                              label: 'TSV (.tsv)',
                              disabled: exportMutation.isPending || exportGate.locked,
                              onClick: () => exportMutation.mutate('tsv'),
                            },
                          ],
                        },
                      ]
                    : []),
                ]}
              />
            )}
            {toolbarActions?.actions}
          </div>
        </div>
      )}
      {/* Table container — flex column, fills remaining space */}
      <div className="relative border rounded-lg overflow-hidden flex flex-col" style={{ height: MODE_HEIGHTS[mode] }}>
        {/* Refetch in flight, or a change waiting on one: previous rows stay, a thin bar runs along the top edge */}
        {(isFetching || isSyncing) && !isLoading && (
          <div
            role="progressbar"
            aria-label="Loading"
            className="pointer-events-none absolute inset-x-0 top-0 z-30 h-0.5 overflow-hidden bg-primary/15"
          >
            <motion.div
              className="h-full w-1/3 bg-primary"
              initial={{ x: '-100%' }}
              animate={{ x: '300%' }}
              transition={{ duration: 1.1, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
            />
          </div>
        )}
        {/* A refetch failed with rows on screen: they stay, marked as the earlier answer */}
        {isError && hasRows && !isLoading && <DataTableRefreshFailed refetch={refetch} />}
        {/* Shared slot: SelectionBar OR FilterPanel (mutually exclusive, animated) */}
        <AnimatePresence mode="wait">
          {selectedCount > 0 ? (
            <motion.div
              key="selection"
              className="shrink-0 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <DataTableSelectionBar
                table={table}
                importExport={importExport}
                exportHidden={!exportGate.granted}
                exportLockTip={exportGate.locked ? lockedTip(exportGate) : undefined}
              >
                {selectActions?.(table.getFilteredSelectedRowModel().rows)}
              </DataTableSelectionBar>
            </motion.div>
          ) : filters && filtersOpen ? (
            <motion.div
              key="filters"
              className="shrink-0 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <DataTableFilters filters={filters} table={table} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/*
          Fixed header + scrolling body — same pattern as the app layout's fixed page header over
          scrolling content: the header lives OUTSIDE the vertical scroller, so the vertical scrollbar
          starts BELOW the header. Horizontal scroll lives on the body (so the sticky actions column
          keeps pinning) and a one-line scrollLeft mirror (syncHeaderScroll) keeps the header columns
          aligned with the body. Both tables are table-fixed with the same minWidth + per-column sizes so
          columns align. No scrollbar-gutter — it reserves a visible empty strip under Safari's overlay
          scrollbars; overlay scrollbars have no width, so the columns line up without it.
        */}
        <div className="flex w-full flex-col flex-1 min-h-0">
          {/* Header region — never scrolls vertically; mirrors the body's horizontal scroll */}
          <div ref={headerScrollRef} onScroll={syncBodyScroll} className="shrink-0 overflow-hidden">
            <table
              className="w-full caption-bottom text-sm table-fixed"
              style={{ minWidth: table.getCenterTotalSize() }}
            >
              {columnWidths}
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup, rowIndex, headerGroups) => (
                  <TableRow
                    key={headerGroup.id}
                    // a group row has no rule under it: its brackets lead into the columns, and an ungrouped column's
                    // empty slot above it merges with its header
                    className={cn(rowIndex < headerGroups.length - 1 && 'border-b-0!')}
                  >
                    {headerGroup.headers.map((header) => {
                      const isActions = header.column.id === 'actions';
                      const headerAlignClass = isActions ? 'justify-end' : 'justify-center';
                      const isGroup = header.subHeaders.length > 0 && !header.isPlaceholder;
                      const isGroupRow = rowIndex < headerGroups.length - 1;
                      const edges = groupEdges(header.column);
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          style={
                            isActions
                              ? { width: '70px' }
                              : grows(header.column)
                                ? { minWidth: header.getSize() }
                                : { width: header.getSize(), minWidth: header.getSize(), maxWidth: header.getSize() }
                          }
                          className={cn(
                            'relative group/resize',
                            // actions header stays pinned on horizontal scroll; z-20 keeps it above the
                            // regular header cells that scroll underneath it.
                            isActions ? 'text-right sticky right-0 z-20' : 'text-center',
                            // grouped, the two rows together take one ungrouped header row's height
                            isGroupRow && 'h-5 px-0 align-bottom',
                            !isGroupRow && headerGroups.length > 1 && 'h-7',
                            // a group and the column headers under it share one tint, edged where the group starts and ends
                            (isGroup || edges.inGroup) && 'bg-primary/5',
                            isGroup && 'border-x border-border',
                            edges.isFirst && 'border-l border-border',
                            edges.isLast && 'border-r border-border',
                          )}
                          aria-sort={
                            header.column.getCanSort()
                              ? header.column.getIsSorted() === 'asc'
                                ? 'ascending'
                                : header.column.getIsSorted() === 'desc'
                                  ? 'descending'
                                  : 'none'
                              : undefined
                          }
                        >
                          {/*
                            Sticky actions header: an opaque bg-muted overlay so columns scrolling under it
                            don't bleed through. It leaves the bottom 1px transparent, so the parent <tr>'s
                            natural border-b shows through unmodified — no alignment math needed.
                          */}
                          {isActions && (
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-x-0 top-0 bottom-px bg-muted backdrop-blur-sm"
                            />
                          )}
                          <div
                            className={cn(
                              isActions ? 'relative' : undefined,
                              // an ungrouped column's title rises by half the group row so it centres across both rows
                              !isGroupRow && headerGroups.length > 1 && !edges.inGroup && '-translate-y-2.5',
                            )}
                          >
                            {header.isPlaceholder ? null : isGroup ? (
                              <GroupBracket>
                                {typeof header.column.columnDef.header === 'string'
                                  ? header.column.columnDef.header
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </GroupBracket>
                            ) : typeof header.column.columnDef.header === 'string' ? (
                              <div className={cn('flex min-w-0', headerAlignClass)}>
                                <DataTableColumnHeader column={header.column} title={header.column.columnDef.header} />
                              </div>
                            ) : (
                              flexRender(header.column.columnDef.header, header.getContext())
                            )}
                          </div>
                          {!meta?.lockedColumnSizing && header.column.getCanResize() && (
                            <div
                              onPointerDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                'absolute top-0 right-0 w-1 h-full cursor-col-resize select-none touch-none z-10',
                                'opacity-0 group-hover/resize:opacity-100 hover:bg-primary/50',
                                header.column.getIsResizing() && 'opacity-100 bg-primary',
                              )}
                            />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
            </table>
          </div>

          {/* Body region — the only vertical scroller (scrollbar begins here, below the header) and the
              horizontal-scroll driver that the header mirrors. */}
          <div
            ref={bodyScrollRef}
            onScroll={syncHeaderScroll}
            className="relative flex flex-col flex-1 min-h-0 overflow-auto overscroll-auto"
          >
            {!locked && (isLoading || hasRows) && (
              <table
                className="w-full caption-bottom text-sm table-fixed"
                style={{ minWidth: table.getCenterTotalSize() }}
              >
                {columnWidths}
                <TableBody className={cn('transition-opacity', isSyncing && !isLoading && 'opacity-60')}>
                  {isLoading
                    ? Array.from(
                        { length: table.getState().pagination?.pageSize ?? 20 },
                        (_, i) => `skeleton-row-${i}`,
                      ).map((rowKey) => (
                        <TableRow key={rowKey}>
                          {Array.from({ length: columnCount }, (_, i) => `${rowKey}-cell-${i}`).map((cellKey) => (
                            <TableCell key={cellKey} className={densityClasses[density]}>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : table.getRowModel().rows.map((row, index) => {
                        const externallySelected = selectedRowId != null && row.id === selectedRowId;
                        const isSelected = row.getIsSelected() || externallySelected;
                        return (
                          <TableRow
                            key={row.id}
                            data-state={isSelected ? 'selected' : undefined}
                            className="group animate-in fade-in duration-300"
                            style={{ animationDelay: `${Math.min(index, 12) * 25}ms`, animationFillMode: 'both' }}
                          >
                            {row.getVisibleCells().map((cell) => {
                              const isActionsCell = cell.column.id === 'actions';
                              const edges = groupEdges(cell.column);
                              return (
                                <TableCell
                                  key={cell.id}
                                  className={cn(
                                    densityClasses[density],
                                    edges.isFirst && 'border-l border-border/60',
                                    edges.isLast && 'border-r border-border/60',
                                    isActionsCell ? 'px-2 sticky right-0 z-10' : undefined,
                                    onRowClick && !isActionsCell ? 'cursor-pointer' : undefined,
                                  )}
                                  onClick={onRowClick && !isActionsCell ? () => onRowClick(row.original) : undefined}
                                  style={
                                    isActionsCell
                                      ? { width: '70px' }
                                      : grows(cell.column)
                                        ? { minWidth: cell.column.getSize() }
                                        : {
                                            width: cell.column.getSize(),
                                            minWidth: cell.column.getSize(),
                                            maxWidth: cell.column.getSize(),
                                          }
                                  }
                                >
                                  {/*
                                    Sticky actions cell: the frosted bg + scroll shadow live in an absolute
                                    overlay that leaves the bottom 1px transparent. The parent <tr>'s natural
                                    border-b shows through unmodified — guarantees pixel-perfect alignment with
                                    the other cells' row dividers.
                                  */}
                                  {isActionsCell && (
                                    <div
                                      aria-hidden
                                      className="pointer-events-none absolute inset-x-0 top-0 bottom-px bg-background/40 backdrop-blur-sm group-hover:bg-muted/30 group-data-[state=selected]:bg-muted/40"
                                    />
                                  )}
                                  <div
                                    className={cn(
                                      isActionsCell
                                        ? 'relative flex items-center justify-end'
                                        : 'overflow-hidden text-center',
                                    )}
                                  >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                </TableBody>
              </table>
            )}
            {(locked || (!isLoading && !hasRows)) && (
              <div className="flex flex-1 items-center justify-center">{renderNoRows()}</div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination — hidden in compact mode when all rows fit on one page */}
      {(mode !== 'compact' || table.getRowCount() > (table.getState().pagination?.pageSize ?? 20)) && (
        <DataTablePagination table={table} />
      )}

      {/* Import dialog */}
      {importExport?.importEndpoint && showImport && (
        <DataTableImportDialog
          handle={importDialog}
          columns={importExport.columns}
          sampleData={importExport.sampleData}
          importEndpoint={importExport.importEndpoint}
          filename={importExport.filename}
          onSuccess={importExport.onSuccess}
        />
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';
