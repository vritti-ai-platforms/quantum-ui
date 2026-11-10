import type React from 'react';
import { CartesianGrid, Line, LineChart as RechartsLineChart, ReferenceLine, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shadcn/shadcnChart';
import { ChartFrame } from '../Chart/ChartFrame';
import type { ChartEmptyState, ChartInstance, ChartMode, ChartSelection, ChartSeriesInput } from '../Chart/types';
import { hasSeriesValues } from '../Chart/utils';
import { LineChartEmpty } from './LineChartEmpty';
import { LineChartSkeleton } from './LineChartSkeleton';

export type LineCurveType = 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';

export interface LineChartMarker {
  /** X-axis value to draw the vertical line at — epoch milliseconds on a `time` axis. */
  x: number | string;
  /** Short caption drawn beside the top of the line, e.g. `Today`. */
  label?: string;
}

// What a line chart's `select` can add to its rows and series: the axes' ranges and its markers
export interface LineChartSelection<TSeries extends ChartSeriesInput = ChartSeriesInput>
  extends ChartSelection<TSeries> {
  /** Fixed X-axis range on a `time` axis, e.g. a picked date window; also labels the empty state's axis */
  xDomain?: [number, number];
  /** Fixed Y-axis range, e.g. to share one value scale across small-multiple charts */
  yDomain?: [number, number];
  /** Vertical reference lines, e.g. today on a timeline; the X domain stretches to keep each in view */
  markers?: LineChartMarker[];
}

export interface LineChartProps<TSelection extends LineChartSelection> {
  chart: ChartInstance<TSelection>;
  xAxisKey: string;
  /** `tab` fills the screen below a tab's header (the default), `compact` is a fixed 24rem */
  mode?: ChartMode;
  /** The view's context bar, set above the chart; in `tab` mode the chart takes the height its rows leave */
  contextBar?: React.ReactNode;
  className?: string;
  /** An annotation under the drawn chart, below its axis */
  footnote?: React.ReactNode;
  /** Curve interpolation. Use `stepAfter` for values that hold until the next point (e.g. prices). Defaults to `monotone`. */
  curve?: LineCurveType;
  /** Render a dot at each data point. Defaults to `false`. */
  dot?: boolean;
  /** Draws every other colour slot dashed, so a line lying exactly on another still shows both colours */
  dashAlternate?: boolean;
  /** Formats Y-axis ticks and tooltip values. */
  valueFormatter?: (value: number) => string;
  /** Formats X-axis ticks and the tooltip label. */
  xAxisFormatter?: (value: string | number) => string;
  /** Bridge gaps where a series has `null`/`undefined` values. Defaults to `false`. */
  connectNulls?: boolean;
  /** `time` spaces points by elapsed time; `xAxisKey` values must be epoch milliseconds. Defaults to `category`. */
  xAxisType?: 'category' | 'time';
  /** Render the series legend. Set `false` when a `ChartKey` or the title names the series. Defaults to `true`. */
  showLegend?: boolean;
  /** What the chart says inside its frame when no series has a value to draw. Defaults to "No data to show". */
  emptyState?: ChartEmptyState;
}

// A line per drawn series of a `useChart` chart, in the frame that shows its loading, failed and empty states
export function LineChart<TSelection extends LineChartSelection>({
  chart,
  xAxisKey,
  mode = 'tab',
  contextBar,
  className,
  footnote,
  curve = 'monotone',
  dot = false,
  dashAlternate = false,
  valueFormatter,
  xAxisFormatter,
  connectNulls = false,
  xAxisType = 'category',
  showLegend = true,
  emptyState = { title: 'No data to show' },
}: LineChartProps<TSelection>) {
  const { view } = chart;
  const data = view?.rows ?? [];
  const { xDomain, yDomain, markers } = view ?? {};

  return (
    <ChartFrame
      chart={chart}
      isEmpty={!hasSeriesValues(view)}
      skeleton={<LineChartSkeleton lines={view?.series.length ?? 2} className="min-h-0 w-full flex-1" />}
      empty={
        <LineChartEmpty
          {...emptyState}
          xDomain={xAxisType === 'time' ? xDomain : undefined}
          xAxisFormatter={xAxisFormatter}
          markers={markers}
          className="min-h-0 w-full flex-1"
        />
      }
      mode={mode}
      contextBar={contextBar}
      className={className}
      footnote={footnote}
    >
      <ChartContainer config={view?.config ?? {}} className="aspect-auto min-h-0 w-full flex-1">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          {xAxisType === 'time' ? (
            <XAxis
              dataKey={xAxisKey}
              type="number"
              scale="time"
              domain={xDomain ?? ['dataMin', 'dataMax']}
              padding={{ left: 44, right: 44 }}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={24}
              tickFormatter={xAxisFormatter}
            />
          ) : (
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={24}
              tickFormatter={xAxisFormatter}
            />
          )}
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            padding={{ top: 8, bottom: 16 }}
            tickFormatter={valueFormatter}
            width={valueFormatter ? 'auto' : undefined}
            domain={yDomain}
            allowDataOverflow={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                valueFormatter={valueFormatter}
                labelFormatter={
                  xAxisFormatter
                    ? (label, payload) => {
                        const xValue = payload?.[0]?.payload?.[xAxisKey] ?? label;
                        return typeof xValue === 'string' || typeof xValue === 'number' ? xAxisFormatter(xValue) : null;
                      }
                    : undefined
                }
              />
            }
          />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {markers?.map((marker) => (
            <ReferenceLine
              key={String(marker.x)}
              x={marker.x}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
              label={
                marker.label
                  ? { value: marker.label, position: 'insideTopLeft', fill: 'var(--muted-foreground)', fontSize: 12 }
                  : undefined
              }
            />
          ))}
          {view?.series.map((series) => (
            <Line
              key={series.id}
              type={curve}
              dataKey={series.id}
              stroke={`var(--color-${series.id})`}
              strokeWidth={2}
              strokeDasharray={dashAlternate && series.slot % 2 === 1 ? '6 4' : undefined}
              dot={dot ? { r: 4 } : false}
              connectNulls={connectNulls}
            />
          ))}
        </RechartsLineChart>
      </ChartContainer>
    </ChartFrame>
  );
}
