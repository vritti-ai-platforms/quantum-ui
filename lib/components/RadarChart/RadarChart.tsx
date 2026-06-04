import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadarChart } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shadcn/shadcnChart';

interface RadarSeries {
  dataKey: string;
}

export interface RadarChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  angleKey: string;
  radars: RadarSeries[];
  className?: string;
}

export const RadarChart = ({ data, config, angleKey, radars, className }: RadarChartProps) => (
  <ChartContainer config={config} className={className ?? 'min-h-[300px] w-full'}>
    <RechartsRadarChart data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey={angleKey} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      {radars.map((radar) => (
        <Radar
          key={radar.dataKey}
          dataKey={radar.dataKey}
          stroke={`var(--color-${radar.dataKey})`}
          fill={`var(--color-${radar.dataKey})`}
          fillOpacity={0.6}
        />
      ))}
    </RechartsRadarChart>
  </ChartContainer>
);

RadarChart.displayName = 'RadarChart';
