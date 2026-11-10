import type React from 'react';
import { Area, CartesianGrid, AreaChart as RechartsAreaChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shadcn/shadcnChart';
import { ChartEmpty } from '../Chart/ChartEmpty';
import { ChartFrame } from '../Chart/ChartFrame';
import type { ChartEmptyState, ChartInstance, ChartMode, ChartSelection } from '../Chart/types';
import { hasSeriesValues } from '../Chart/utils';
import { Skeleton } from '../Skeleton';

export interface AreaChartProps<TSelection extends ChartSelection> {
  chart: ChartInstance<TSelection>;
  xAxisKey: string;
  /** `tab` fills the screen below a tab's header (the default), `compact` is a fixed 24rem */
  mode?: ChartMode;
  /** The view's context bar, set above the chart; in `tab` mode the chart takes the height its rows leave */
  contextBar?: React.ReactNode;
  className?: string;
  /** An annotation under the drawn chart, below its axis */
  footnote?: React.ReactNode;
  curve?: 'linear' | 'monotone';
  fillOpacity?: number;
  showLegend?: boolean;
  emptyState?: ChartEmptyState;
}

// An area per drawn series of a `useChart` chart, in the frame that shows its loading, failed and empty states
export function AreaChart<TSelection extends ChartSelection>({
  chart,
  xAxisKey,
  mode = 'tab',
  contextBar,
  className,
  footnote,
  curve = 'monotone',
  fillOpacity = 0.3,
  showLegend = true,
  emptyState = { title: 'No data to show' },
}: AreaChartProps<TSelection>) {
  const { view } = chart;
  return (
    <ChartFrame
      chart={chart}
      isEmpty={!hasSeriesValues(view)}
      skeleton={<Skeleton className="min-h-0 w-full flex-1" />}
      empty={<ChartEmpty {...emptyState} />}
      mode={mode}
      contextBar={contextBar}
      className={className}
      footnote={footnote}
    >
      <ChartContainer config={view?.config ?? {}} className="aspect-auto min-h-0 w-full flex-1">
        <RechartsAreaChart data={view?.rows ?? []}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {view?.series.map((series) => (
            <Area
              key={series.id}
              type={curve}
              dataKey={series.id}
              stroke={`var(--color-${series.id})`}
              fill={`var(--color-${series.id})`}
              fillOpacity={fillOpacity}
            />
          ))}
        </RechartsAreaChart>
      </ChartContainer>
    </ChartFrame>
  );
}
