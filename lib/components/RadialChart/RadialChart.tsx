import { Cell, RadialBar, RadialBarChart } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shadcn/shadcnChart';

export interface RadialChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  dataKey: string;
  className?: string;
}

export const RadialChart = ({ data, config, dataKey, className }: RadialChartProps) => (
  <ChartContainer config={config} className={className ?? 'min-h-[300px] w-full'}>
    <RadialBarChart data={data} innerRadius="20%" outerRadius="100%" startAngle={90} endAngle={-270}>
      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
      <RadialBar dataKey={dataKey} background>
        {data.map((entry, index) => {
          const name = (entry as Record<string, unknown>).name as string | undefined;
          const fill =
            name && config[name]?.color ? `var(--color-${name})` : `var(--chart-${index + 1})`;
          return <Cell key={`cell-${name ?? index}`} fill={fill} />;
        })}
      </RadialBar>
      <ChartLegend content={<ChartLegendContent nameKey="name" />} />
    </RadialBarChart>
  </ChartContainer>
);

RadialChart.displayName = 'RadialChart';
