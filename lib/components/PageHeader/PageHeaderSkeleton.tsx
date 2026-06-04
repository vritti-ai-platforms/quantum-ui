import type * as React from 'react';
import { cn } from '../../../shadcn/utils';
import { Skeleton } from '../Skeleton';

export interface PageHeaderSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showDescription?: boolean;
  showActions?: boolean;
}

export const PageHeaderSkeleton = ({
  showDescription = true,
  showActions = true,
  className,
  ...props
}: PageHeaderSkeletonProps) => (
  <div className={cn('flex items-start justify-between gap-4', className)} {...props}>
    <div className="space-y-1">
      <Skeleton className="h-7 w-40" />
      {showDescription && <Skeleton className="h-5 w-80" />}
    </div>
    {showActions && <Skeleton className="h-8 w-14 rounded-md" />}
  </div>
);

PageHeaderSkeleton.displayName = 'PageHeaderSkeleton';
