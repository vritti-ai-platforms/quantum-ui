import type React from 'react';
import { cn } from '../../../shadcn/utils';
import { Skeleton } from '../Skeleton';

export interface CompactTableSkeletonColumn {
  // Tailwind width class for the header-cell skeleton (e.g. 'w-20').
  headerWidth?: string;
  // Tailwind width class for the body-cell skeleton (e.g. 'w-28').
  cellWidth?: string;
}

export interface CompactTableSkeletonProps {
  // Either a column count (uses sensible defaults) or per-column width hints.
  columns?: number | CompactTableSkeletonColumn[];
  // Number of body rows to render. Defaults to 5.
  rows?: number;
  // Append a fixed-width trailing column for row actions.
  actions?: boolean;
  className?: string;
}

const DEFAULT_COLUMNS: CompactTableSkeletonColumn[] = [
  { headerWidth: 'w-20', cellWidth: 'w-28' },
  { headerWidth: 'w-16', cellWidth: 'w-44' },
  { headerWidth: 'w-16', cellWidth: 'w-16' },
];

// Mirrors the shape of <DataTable mode="compact" />: bordered card, tinted header row, tight
// padded body rows. Use as a loading placeholder when the actual data is being fetched.
export const CompactTableSkeleton: React.FC<CompactTableSkeletonProps> = ({
  columns = DEFAULT_COLUMNS,
  rows = 5,
  actions = false,
  className,
}) => {
  const cols: CompactTableSkeletonColumn[] =
    typeof columns === 'number'
      ? Array.from({ length: columns }, (_, i) => DEFAULT_COLUMNS[i % DEFAULT_COLUMNS.length] ?? {})
      : columns;

  return (
    <div className={cn('rounded-md border overflow-hidden', className)}>
      <table className="w-full">
        <thead className="bg-muted/40">
          <tr className="border-b">
            {cols.map((col, i) => (
              <th
                // biome-ignore lint/suspicious/noArrayIndexKey: <static skeleton list>
                key={`ct-skel-th-${i}`}
                className="px-3 py-2.5 text-left"
              >
                <Skeleton className={cn('h-4', col.headerWidth ?? 'w-16')} />
              </th>
            ))}
            {actions && <th className="px-3 py-2.5 w-12" />}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              // biome-ignore lint/suspicious/noArrayIndexKey: <static skeleton list>
              key={`ct-skel-tr-${rowIndex}`}
              className="border-b last:border-b-0"
            >
              {cols.map((col, colIndex) => (
                <td
                  // biome-ignore lint/suspicious/noArrayIndexKey: <static skeleton list>
                  key={`ct-skel-td-${rowIndex}-${colIndex}`}
                  className="px-3 py-2.5"
                >
                  <Skeleton className={cn('h-4', col.cellWidth ?? 'w-24')} />
                </td>
              ))}
              {actions && (
                <td className="px-3 py-2.5">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
