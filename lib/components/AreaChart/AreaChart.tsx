import { Area, CartesianGrid, AreaChart as RechartsAreaChart, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shadcn/shadcnChart';

interface AreaSeries {
  dataKey: string;
  type?: 'linear' | 'monotone';
  fillOpacity?: number;
}

export interface AreaChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  xAxisKey: string;
  areas: AreaSeries[];
  className?: string;
}

export const AreaChart = ({ data, config, xAxisKey, areas, className }: AreaChartProps) => (
  <ChartContainer config={config} className={className ?? 'min-h-[300px] w-full'}>
    <RechartsAreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} />
      <YAxis tickLine={false} axisLine={false} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      {areas.map((area) => (
        <Area
          key={area.dataKey}
          type={area.type ?? 'monotone'}
          dataKey={area.dataKey}
          stroke={`var(--color-${area.dataKey})`}
          fill={`var(--color-${area.dataKey})`}
          fillOpacity={area.fillOpacity ?? 0.3}
        />
      ))}
    </RechartsAreaChart>
  </ChartContainer>
);

AreaChart.displayName = 'AreaChart';
