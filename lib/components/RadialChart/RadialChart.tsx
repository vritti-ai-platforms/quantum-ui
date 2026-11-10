import type React from 'react';
import { Cell, RadialBar, RadialBarChart } from 'recharts';
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
import { Skeleton } from '../Skeleton';

export interface RadialChartProps<TSelection extends ChartSelection> {
  /** Each series is a ring: its `id` is the ring row's `nameKey` value */
  chart: ChartInstance<TSelection>;
  dataKey: string;
  nameKey?: string;
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

// A ring per drawn series of a `useChart` chart, in the frame that shows its loading, failed and empty states
export function RadialChart<TSelection extends ChartSelection>({
  chart,
  dataKey,
  nameKey = 'name',
  mode = 'tab',
  contextBar,
  className,
  footnote,
  showLegend = true,
  emptyState = { title: 'No data to show' },
}: RadialChartProps<TSelection>) {
  const { view } = chart;
  const drawn = new Set(view?.series.map((series) => series.id));
  const rings = (view?.rows ?? []).filter((row) => drawn.has(String(row[nameKey])) && row[dataKey] != null);

  return (
    <ChartFrame
      chart={chart}
      isEmpty={rings.length === 0}
      skeleton={<Skeleton className="mx-auto aspect-square min-h-0 flex-1 rounded-full" />}
      empty={<ChartEmpty {...emptyState} />}
      mode={mode}
      contextBar={contextBar}
      className={className}
      footnote={footnote}
    >
      <ChartContainer config={view?.config ?? {}} className="aspect-auto min-h-0 w-full flex-1">
        <RadialBarChart data={rings} innerRadius="20%" outerRadius="100%" startAngle={90} endAngle={-270}>
          <ChartTooltip content={<ChartTooltipContent hideLabel nameKey={nameKey} />} />
          <RadialBar dataKey={dataKey} background>
            {rings.map((ring) => (
              <Cell key={String(ring[nameKey])} fill={`var(--color-${String(ring[nameKey])})`} />
            ))}
          </RadialBar>
          {showLegend && <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />}
        </RadialBarChart>
      </ChartContainer>
    </ChartFrame>
  );
}
