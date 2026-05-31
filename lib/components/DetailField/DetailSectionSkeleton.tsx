import { Skeleton } from '../Skeleton';
import { DetailSection } from './DetailSection';

export interface DetailSectionSkeletonProps {
  /** Number of field placeholders to render */
  count?: number;
  /** Allow the plate to wrap onto multiple rows */
  wrap?: boolean;
  className?: string;
}

// Loading placeholder matching <DetailSection> with <DetailField> children: a bordered, divided
// plate where each cell is a label + value skeleton.
export const DetailSectionSkeleton = ({ count = 3, wrap, className }: DetailSectionSkeletonProps) => (
  <DetailSection wrap={wrap} className={className}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        // biome-ignore lint/suspicious/noArrayIndexKey: <static skeleton list>
        key={`detail-skel-${i}`}
        className="space-y-1.5 px-4 py-2"
      >
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </DetailSection>
);

DetailSectionSkeleton.displayName = 'DetailSectionSkeleton';
