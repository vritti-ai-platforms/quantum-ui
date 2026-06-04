import type * as React from 'react';
import { cn } from '../../../shadcn/utils';
import { Skeleton } from '../Skeleton';

export interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton cards to render */
  count?: number;
}

// Renders skeleton cards matching Card shell — consumer controls inner padding via children
export const CardSkeleton = ({ count = 1, className, children, ...props }: CardSkeletonProps) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <div
        // biome-ignore lint/suspicious/noArrayIndexKey: <static list of skeletons, not dynamic>
        key={i}
        className={cn('bg-card text-card-foreground rounded-xl border py-6', className)}
        {...props}
      >
        {children ?? (
          <div className="px-6">
            <Skeleton className="h-6 w-full" />
          </div>
        )}
      </div>
    ))}
  </>
);

CardSkeleton.displayName = 'CardSkeleton';
