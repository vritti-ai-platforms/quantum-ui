import type * as React from 'react';
import { cn } from '../../../shadcn/utils';
import { Skeleton } from '../Skeleton';

export interface DangerZoneSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showWarning?: boolean;
}

export const DangerZoneSkeleton = ({
  showWarning = false,
  className,
  ...props
}: DangerZoneSkeletonProps) => (
  <div className={cn('bg-card text-card-foreground rounded-xl border py-6', className)} {...props}>
    <div className="flex flex-col gap-6">
      <div className="px-6 flex items-center gap-2">
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        {showWarning && (
          <div className="mt-4">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        )}
      </div>
    </div>
  </div>
);

DangerZoneSkeleton.displayName = 'DangerZoneSkeleton';
