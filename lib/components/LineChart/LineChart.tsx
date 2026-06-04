import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shadcn/shadcnChart';

interface LineSeries {
  dataKey: string;
  type?: 'linear' | 'monotone';
}

export interface LineChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  xAxisKey: string;
  lines: LineSeries[];
  className?: string;
}

export const LineChart = ({ data, config, xAxisKey, lines, className }: LineChartProps) => (
  <ChartContainer config={config} className={className ?? 'min-h-[300px] w-full'}>
    <RechartsLineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} />
      <YAxis tickLine={false} axisLine={false} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      {lines.map((line) => (
        <Line
          key={line.dataKey}
          type={line.type ?? 'monotone'}
          dataKey={line.dataKey}
          stroke={`var(--color-${line.dataKey})`}
          strokeWidth={2}
          dot={false}
        />
      ))}
    </RechartsLineChart>
  </ChartContainer>
);

LineChart.displayName = 'LineChart';
