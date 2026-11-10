import type React from 'react';
import { cn } from '../../../shadcn/utils';
import { ChartFootnote, ChartLoadFailed, ChartRefreshFailed } from './ChartStates';
import type { ChartInstance, ChartMode, ChartSelection } from './types';

// `tab` sizes the context bar and the frame together, so the frame takes whatever the bar's rows leave; `compact` sizes
// the frame alone
const PANEL_HEIGHTS: Record<ChartMode, string> = {
  tab: 'h-[max(calc(100svh-12.5rem),31rem)]',
  compact: '',
};
const FRAME_HEIGHTS: Record<ChartMode, string> = {
  tab: 'min-h-0 flex-1',
  compact: 'h-96',
};

interface ChartFrameProps<TSelection extends ChartSelection> {
  chart: ChartInstance<TSelection>;
  /** Nothing in the view to draw */
  isEmpty: boolean;
  skeleton: React.ReactNode;
  empty: React.ReactNode;
  mode: ChartMode;
  /** The view's context bar, set above the frame */
  contextBar?: React.ReactNode;
  /** Adjusts the frame, e.g. `border-0 p-0` inside a titled card */
  className?: string;
  /** An annotation set under the drawn chart, below its axis, like a printed chart's note */
  footnote?: React.ReactNode;
  children: React.ReactNode;
}

// Which of a chart's states to show: its skeleton while loading, a failed first load, its empty state, or the chart
function ChartFrameContent<TSelection extends ChartSelection>({
  chart,
  isEmpty,
  skeleton,
  empty,
  footnote,
  children,
}: Pick<ChartFrameProps<TSelection>, 'chart' | 'isEmpty' | 'skeleton' | 'empty' | 'footnote' | 'children'>) {
  if (chart.isLoading) return skeleton;
  if (isEmpty && chart.isError) return <ChartLoadFailed error={chart.error} refetch={chart.refetch} />;
  if (isEmpty) return empty;

  return (
    <>
      {chart.isError && <ChartRefreshFailed refetch={chart.refetch} />}
      {children}
      {footnote && <ChartFootnote>{footnote}</ChartFootnote>}
    </>
  );
}

// The bordered frame every chart draws in, under its context bar and as tall as its `mode`
export function ChartFrame<TSelection extends ChartSelection>({
  mode,
  contextBar,
  className,
  ...content
}: ChartFrameProps<TSelection>) {
  return (
    <div className={cn('flex flex-col gap-4', PANEL_HEIGHTS[mode])}>
      {contextBar}
      <div
        className={cn('flex w-full flex-col gap-2 rounded-lg border border-border p-4', FRAME_HEIGHTS[mode], className)}
      >
        <ChartFrameContent {...content} />
      </div>
    </div>
  );
}
