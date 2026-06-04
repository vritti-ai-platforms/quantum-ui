import { Bar, CartesianGrid, BarChart as RechartsBarChart, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shadcn/shadcnChart';

interface BarSeries {
  dataKey: string;
  radius?: number;
}

export interface BarChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  xAxisKey: string;
  bars: BarSeries[];
  className?: string;
}

export const BarChart = ({ data, config, xAxisKey, bars, className }: BarChartProps) => (
  <ChartContainer config={config} className={className ?? 'min-h-[300px] w-full'}>
    <RechartsBarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} />
      <YAxis tickLine={false} axisLine={false} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      {bars.map((bar) => (
        <Bar
          key={bar.dataKey}
          dataKey={bar.dataKey}
          fill={`var(--color-${bar.dataKey})`}
          radius={bar.radius ?? 4}
        />
      ))}
    </RechartsBarChart>
  </ChartContainer>
);

BarChart.displayName = 'BarChart';
