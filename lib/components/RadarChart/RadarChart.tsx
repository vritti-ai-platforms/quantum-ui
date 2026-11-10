import type React from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadarChart } from 'recharts';
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

export interface RadarChartProps<TSelection extends ChartSelection> {
  chart: ChartInstance<TSelection>;
  angleKey: string;
  /** `tab` fills the screen below a tab's header (the default), `compact` is a fixed 24rem */
  mode?: ChartMode;
  /** The view's context bar, set above the chart; in `tab` mode the chart takes the height its rows leave */
  contextBar?: React.ReactNode;
  className?: string;
  /** An annotation under the drawn chart, below its axis */
  footnote?: React.ReactNode;
  showLegend?: boolean;
  emptyState?: ChartEmptyState;
}

// A radar per drawn series of a `useChart` chart, in the frame that shows its loading, failed and empty states
export function RadarChart<TSelection extends ChartSelection>({
  chart,
  angleKey,
  mode = 'tab',
  contextBar,
  className,
  footnote,
  showLegend = true,
  emptyState = { title: 'No data to show' },
}: RadarChartProps<TSelection>) {
  const { view } = chart;
  return (
    <ChartFrame
      chart={chart}
      isEmpty={!hasSeriesValues(view)}
      skeleton={<Skeleton className="mx-auto aspect-square min-h-0 flex-1 rounded-full" />}
      empty={<ChartEmpty {...emptyState} />}
      mode={mode}
      contextBar={contextBar}
      className={className}
      footnote={footnote}
    >
      <ChartContainer config={view?.config ?? {}} className="aspect-auto min-h-0 w-full flex-1">
        <RechartsRadarChart data={view?.rows ?? []}>
          <PolarGrid />
          <PolarAngleAxis dataKey={angleKey} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {view?.series.map((series) => (
            <Radar
              key={series.id}
              dataKey={series.id}
              stroke={`var(--color-${series.id})`}
              fill={`var(--color-${series.id})`}
              fillOpacity={0.6}
            />
          ))}
        </RechartsRadarChart>
      </ChartContainer>
    </ChartFrame>
  );
}
