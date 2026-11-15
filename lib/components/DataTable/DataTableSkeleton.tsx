import type React from 'react';
import { cn } from '../../../shadcn/utils';
import { Skeleton } from '../Skeleton';
import { DATA_TABLE_MODE_HEIGHTS, type DataTableMode } from './modes';

export interface DataTableSkeletonProps {
  mode?: DataTableMode;
  columns?: number;
  rows?: number;
  // Whether the toolbar has an action button beside its view controls
  toolbarAction?: boolean;
  className?: string;
}

// Loading placeholder mirroring <DataTable mode={…} />: the toolbar, the bordered table at the mode's height and the
// pagination (left out in compact mode, as the table leaves it out when its rows fit on one page), so the page does not
// jump when the table arrives
export const DataTableSkeleton: React.FC<DataTableSkeletonProps> = ({
  mode = 'page',
  columns = 4,
  rows = 6,
  toolbarAction = true,
  className,
}) => (
  <div className={cn('flex flex-col gap-2', className)}>
    <div className="flex items-center justify-end gap-2">
      <Skeleton className="size-8" />
      <Skeleton className="size-8" />
      <Skeleton className="size-8" />
      {toolbarAction && <Skeleton className="h-8 w-28" />}
    </div>
    <div className="flex flex-col overflow-hidden rounded-lg border" style={{ height: DATA_TABLE_MODE_HEIGHTS[mode] }}>
      <div className="flex gap-6 border-b bg-muted/40 px-4 py-3.5">
        {Array.from({ length: columns }).map((_, columnIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <static skeleton list>
          <Skeleton key={`dt-skel-th-${columnIndex}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <static skeleton list>
        <div key={`dt-skel-tr-${rowIndex}`} className="flex gap-6 border-b px-4 py-4">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <static skeleton list>
            <Skeleton key={`dt-skel-td-${rowIndex}-${columnIndex}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
    {/* A compact table hides its pagination while its rows fit on one page, which a compact table's usually do */}
    {mode !== 'compact' && (
      <div className="flex items-center justify-between px-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
      </div>
    )}
  </div>
);
