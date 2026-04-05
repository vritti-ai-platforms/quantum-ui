import { useMutation } from '@tanstack/react-query';
import { flexRender } from '@tanstack/react-table';
import { ArrowDownToLine, ArrowUpFromLine, Funnel, TableProperties } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shadcn/shadcnTable';
import { cn } from '../../../shadcn/utils';
import { useDialog } from '../../hooks/useDialog';
import { axios } from '../../utils/axios';
import { Button } from '../Button';
import { DropdownMenu } from '../DropdownMenu';
import { Skeleton } from '../Skeleton';
import { DataTableColumnHeader } from './components/DataTableColumnHeader';
import { DataTableEmpty } from './components/DataTableEmpty';
import { DataTableFilters } from './components/DataTableFilters';
import { DataTableImportDialog } from './components/DataTableImportDialog';
import { DataTablePagination } from './components/DataTablePagination';
import { DataTableRowDensity } from './components/DataTableRowDensity';
import { DataTableSearch } from './components/DataTableSearch';
import { DataTableSelectionBar } from './components/DataTableSelectionBar';
import { DataTableViewOptions } from './components/DataTableViewOptions';
import { DataTableViewsMenu } from './components/DataTableViewsMenu';
import { DataTableViewTabs } from './components/DataTableViewTabs';
import { useDataTableStore } from './store/store';
import type { DataTableMeta, DataTableProps, DensityType, SearchState } from './types';
import { downloadBlob } from './utils';

const densityClasses: Record<DensityType, string> = {
  compact: 'py-1 px-2 text-xs',
  normal: 'py-2 px-3 text-sm',
  comfortable: 'py-4 px-3 text-sm',
};

const MODE_HEIGHTS = {
  page: 'calc(100vh - 280px)',
  compact: 'calc(100vh - 570px)',
};

// Renders a full-featured data table from a raw TanStack Table instance
export function DataTable<TData>({
  table,
  searchConfig,
  selectActions,
  emptyStateConfig,
  toolbarActions,
  filters,
  isLoading = false,
  className,
  enableViews = true,
  importExport,
  mode = 'page',
}: DataTableProps<TData>) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const importDialog = useDialog();

  const meta = table.options.meta as DataTableMeta | undefined;
  const slug = meta?.slug;
  const appliedFilterCount = useDataTableStore((s) => (slug ? (s.tables[slug]?.activeState?.filters?.length ?? 0) : 0));
  const density = meta?.density ?? 'normal';
  const columnCount = table.getAllColumns().length;
  const visibilityEnabled = table.options.enableHiding !== false;
  const showToolbar =
    searchConfig || visibilityEnabled || toolbarActions || filters || (enableViews && slug) || importExport;

  const search = meta?.search ?? null;
  const onSearchChange = (s: SearchState) => meta?.setSearch?.(s);

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  // Auto-close filters when rows are selected
  useEffect(() => {
    if (selectedCount > 0) setFiltersOpen(false);
  }, [selectedCount]);

  const exportMutation = useMutation({
    mutationFn: async (format: string) => {
      if (!importExport) return;
      const response = await axios.get(`${importExport.exportEndpoint}/${format}`, {
        responseType: 'blob',
        showSuccessToast: false,
      });
      downloadBlob(response.data, `${importExport.filename}.${format}`);
    },
  });

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center gap-4">
          {/* LEFT: view tabs (flex-1) when viewsConfig set; otherwise spacer */}
          <div className="flex min-w-0 flex-1">{enableViews && slug && <DataTableViewTabs slug={slug} />}</div>

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
            {importExport && (
              <DropdownMenu
                trigger={{
                  children: (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Import / Export">
                      <TableProperties className="h-4 w-4" />
                    </Button>
                  ),
                }}
                items={[
                  {
                    type: 'item' as const,
                    id: 'import',
                    label: 'Import',
                    icon: ArrowUpFromLine,
                    onClick: importDialog.open,
                  },
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
                        disabled: exportMutation.isPending,
                        onClick: () => exportMutation.mutate('csv'),
                      },
                      {
                        type: 'item' as const,
                        id: 'xlsx',
                        label: 'Excel (.xlsx)',
                        disabled: exportMutation.isPending,
                        onClick: () => exportMutation.mutate('xlsx'),
                      },
                      {
                        type: 'item' as const,
                        id: 'xls',
                        label: 'Excel 97-2004 (.xls)',
                        disabled: exportMutation.isPending,
                        onClick: () => exportMutation.mutate('xls'),
                      },
                      {
                        type: 'item' as const,
                        id: 'ods',
                        label: 'OpenDocument (.ods)',
                        disabled: exportMutation.isPending,
                        onClick: () => exportMutation.mutate('ods'),
                      },
                      {
                        type: 'item' as const,
                        id: 'tsv',
                        label: 'TSV (.tsv)',
                        disabled: exportMutation.isPending,
                        onClick: () => exportMutation.mutate('tsv'),
                      },
                    ],
                  },
                ]}
              />
            )}
            {toolbarActions?.actions}
          </div>
        </div>
      )}

      {/* Table container — flex column, fills remaining space */}
      <div className="border rounded-lg overflow-hidden flex flex-col" style={{ height: MODE_HEIGHTS[mode] }}>
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
              <DataTableSelectionBar table={table} importExport={importExport}>
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

        {/* Fixed header */}
        <div className="shrink-0" style={{ minWidth: table.getCenterTotalSize() }}>
          <table className="w-full text-sm">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isActions = header.column.id === 'actions';
                    const headerAlignClass = isActions ? 'justify-end' : 'justify-center';
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: isActions ? '52px' : header.getSize() }}
                        className={cn('relative group/resize', isActions ? 'text-right' : 'text-center')}
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
                        {header.isPlaceholder ? null : typeof header.column.columnDef.header === 'string' ? (
                          <div className={cn('flex', headerAlignClass)}>
                            <DataTableColumnHeader column={header.column} title={header.column.columnDef.header} />
                          </div>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                        {!meta?.lockedColumnSizing && header.column.getCanResize() && (
                          <div
                            onPointerDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              'absolute top-0 right-0 w-1 h-full cursor-col-resize select-none touch-none',
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

        {/* Scrollable body — only this area has the scrollbar */}
        <div className="relative flex w-full flex-col overflow-auto overscroll-none flex-1">
          <table className="w-full caption-bottom text-sm" style={{ minWidth: table.getCenterTotalSize() }}>
            {(isLoading || table.getRowModel().rows.length > 0) && (
              <TableBody>
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
                  : table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={densityClasses[density]}
                            style={{ width: cell.column.id === 'actions' ? '52px' : cell.column.getSize() }}
                          >
                            <div
                              className={cn(
                                'flex items-center',
                                cell.column.id === 'actions' ? 'justify-end' : 'justify-center',
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
              </TableBody>
            )}
          </table>
          {!isLoading && table.getRowModel().rows.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <DataTableEmpty
                icon={emptyStateConfig?.icon}
                title={emptyStateConfig?.title}
                description={emptyStateConfig?.description}
                action={emptyStateConfig?.action}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pagination — hidden in compact mode when all rows fit on one page */}
      {(mode !== 'compact' || table.getRowCount() > (table.getState().pagination?.pageSize ?? 20)) && (
        <DataTablePagination table={table} />
      )}

      {/* Import dialog */}
      {importExport && (
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
