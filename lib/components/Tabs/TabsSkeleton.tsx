import type * as React from 'react';
import { cn } from '../../../shadcn/utils';
import { Skeleton } from '../Skeleton';

const DEFAULT_TAB_WIDTHS = ['w-20', 'w-14', 'w-16', 'w-24', 'w-18'];

export interface TabsSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of tab triggers to render */
  count?: number;
  /** Height of the content area below the tabs */
  contentHeight?: string;
  /** Custom widths for each tab trigger (Tailwind width classes) */
  tabWidths?: string[];
}

export const TabsSkeleton = ({
  count = 3,
  contentHeight = '500px',
  tabWidths,
  className,
  ...props
}: TabsSkeletonProps) => {
  const widths = tabWidths ?? DEFAULT_TAB_WIDTHS;

  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      <div className="inline-flex h-9 w-fit items-center gap-0.5 rounded-lg bg-muted p-[3px]">
        {Array.from({ length: count }, (_, i) => (
          <Skeleton
            key={i}
            className={cn('h-7 rounded-md', widths[i % widths.length], i === 0 && 'bg-background')}
          />
        ))}
      </div>
      <Skeleton className="w-full rounded-lg" style={{ height: contentHeight }} />
    </div>
  );
};

TabsSkeleton.displayName = 'TabsSkeleton';
