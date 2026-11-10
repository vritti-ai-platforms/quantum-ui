import type React from 'react';
import { Cell, Pie, PieChart as RechartsPieChart } from 'recharts';
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

export interface PieChartProps<TSelection extends ChartSelection> {
  /** Each series is a slice: its `id` is the slice row's `nameKey` value */
  chart: ChartInstance<TSelection>;
  dataKey: string;
  nameKey: string;
  /** `tab` fills the screen below a tab's header (the default), `compact` is a fixed 24rem */
  mode?: ChartMode;
  /** The view's context bar, set above the chart; in `tab` mode the chart takes the height its rows leave */
  contextBar?: React.ReactNode;
  className?: string;
  /** An annotation under the drawn chart, below its axis */
  footnote?: React.ReactNode;
  // Drops the legend — for a compact pie whose slices are named by the tooltip or the surrounding UI
  hideLegend?: boolean;
  // Turns the pie into a donut; a number is pixels, a string a percentage of the radius (e.g. '60%')
  innerRadius?: number | string;
  emptyState?: ChartEmptyState;
}

// A slice per drawn series of a `useChart` chart, in the frame that shows its loading, failed and empty states
export function PieChart<TSelection extends ChartSelection>({
  chart,
  dataKey,
  nameKey,
  mode = 'tab',
  contextBar,
  className,
  footnote,
  hideLegend,
  innerRadius,
  emptyState = { title: 'No data to show' },
}: PieChartProps<TSelection>) {
  const { view } = chart;
  const drawn = new Set(view?.series.map((series) => series.id));
  const slices = (view?.rows ?? []).filter((row) => drawn.has(String(row[nameKey])) && row[dataKey] != null);

  return (
    <ChartFrame
      chart={chart}
      isEmpty={slices.length === 0}
      skeleton={<Skeleton className="mx-auto aspect-square min-h-0 flex-1 rounded-full" />}
      empty={<ChartEmpty {...emptyState} />}
      mode={mode}
      contextBar={contextBar}
      className={className}
      footnote={footnote}
    >
      <ChartContainer config={view?.config ?? {}} className="aspect-auto min-h-0 w-full flex-1">
        <RechartsPieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={slices} dataKey={dataKey} nameKey={nameKey} innerRadius={innerRadius}>
            {slices.map((slice) => (
              <Cell key={String(slice[nameKey])} fill={`var(--color-${String(slice[nameKey])})`} />
            ))}
          </Pie>
          {!hideLegend && <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />}
        </RechartsPieChart>
      </ChartContainer>
    </ChartFrame>
  );
}
