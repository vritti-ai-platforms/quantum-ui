import { CartesianGrid, Line, LineChart as RechartsLineChart, ReferenceLine, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shadcn/shadcnChart';

export type LineCurveType = 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';

export interface LineSeries {
  dataKey: string;
  /** Curve interpolation. Use `stepAfter` for values that hold until the next point (e.g. prices). Defaults to `monotone`. */
  type?: LineCurveType;
  /** Render a dot at each data point. Defaults to `false`. */
  dot?: boolean;
  /** Bridge gaps where this series has `null`/`undefined` values. Overrides the chart-level `connectNulls`. */
  connectNulls?: boolean;
  /** SVG dash pattern, e.g. `'6 4'` — a second encoding so a line lying exactly on another stays visible. Solid by default. */
  strokeDasharray?: string;
}

export interface LineChartMarker {
  /** X-axis value to draw the vertical line at — epoch milliseconds on a `time` axis. */
  x: number | string;
  /** Short caption drawn beside the top of the line, e.g. `Today`. */
  label?: string;
}

export interface LineChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  xAxisKey: string;
  lines: LineSeries[];
  className?: string;
  /** Formats Y-axis ticks and tooltip values. */
  valueFormatter?: (value: number) => string;
  /** Formats X-axis ticks and the tooltip label. */
  xAxisFormatter?: (value: string | number) => string;
  /** Default for every series' `connectNulls`. Defaults to `false`. */
  connectNulls?: boolean;
  /** `time` spaces points by elapsed time; `xAxisKey` values must be epoch milliseconds. Defaults to `category`. */
  xAxisType?: 'category' | 'time';
  /** Render the series legend. Set `false` for single-series charts whose title already names the series. Defaults to `true`. */
  showLegend?: boolean;
  /** Fixed Y-axis range, e.g. to share one value scale across small-multiple charts. Defaults to recharts auto. */
  yDomain?: [number, number];
  /** Vertical reference lines, e.g. today on a timeline. The X domain stretches to keep each one in view. */
  markers?: LineChartMarker[];
}

export const LineChart = ({
  data,
  config,
  xAxisKey,
  lines,
  className,
  valueFormatter,
  xAxisFormatter,
  connectNulls = false,
  xAxisType = 'category',
  showLegend = true,
  yDomain,
  markers,
}: LineChartProps) => (
  <ChartContainer config={config} className={className ?? 'min-h-75 w-full'}>
    <RechartsLineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      {xAxisType === 'time' ? (
        <XAxis
          dataKey={xAxisKey}
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
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
      {lines.map((line) => (
        <Line
          key={line.dataKey}
          type={line.type ?? 'monotone'}
          dataKey={line.dataKey}
          stroke={`var(--color-${line.dataKey})`}
          strokeWidth={2}
          strokeDasharray={line.strokeDasharray}
          dot={line.dot ? { r: 4 } : false}
          connectNulls={line.connectNulls ?? connectNulls}
        />
      ))}
    </RechartsLineChart>
  </ChartContainer>
);

LineChart.displayName = 'LineChart';
