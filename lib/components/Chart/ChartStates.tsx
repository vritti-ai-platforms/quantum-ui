import { TriangleAlert } from 'lucide-react';
import type React from 'react';
import { problemDetail } from '../../utils/axios';
import { Button } from '../Button';
import { Empty } from '../Empty';

// The first load failed, so there is nothing to draw: what went wrong, and a retry
export const ChartLoadFailed = ({ error, refetch }: { error: unknown; refetch?: () => unknown }) => (
  <Empty
    icon={<TriangleAlert />}
    iconColor="destructive"
    title="Couldn't load the chart"
    description={problemDetail(error) ?? 'Something went wrong while loading. Try again.'}
    action={
      refetch && (
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      )
    }
    className="min-h-0 flex-1"
  />
);

// A refetch failed while a chart is drawn: the chart stays, with this note above it
export const ChartRefreshFailed = ({ refetch }: { refetch?: () => unknown }) => (
  <div role="alert" className="flex items-center justify-between gap-2 text-xs text-destructive">
    <span className="flex items-center gap-1.5">
      <TriangleAlert className="size-3.5" aria-hidden />
      Couldn't refresh — showing earlier data.
    </span>
    {refetch && (
      <Button variant="link" size="sm" className="h-auto p-0 text-xs text-destructive" onClick={() => refetch()}>
        Retry
      </Button>
    )}
  </div>
);

// A note under the drawn chart, below its axis, set like a printed chart's note
export const ChartFootnote = ({ children }: { children: React.ReactNode }) => (
  <p className="flex items-baseline gap-2.5 border-t border-dashed border-border pt-2.5 text-xs leading-relaxed text-muted-foreground">
    <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">Note</span>
    <span className="text-pretty">{children}</span>
  </p>
);
