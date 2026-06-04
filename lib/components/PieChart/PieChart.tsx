import { Cell, Pie, PieChart as RechartsPieChart } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shadcn/shadcnChart';

export interface PieChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  dataKey: string;
  nameKey: string;
  className?: string;
}

export const PieChart = ({ data, config, dataKey, nameKey, className }: PieChartProps) => (
  <ChartContainer config={config} className={className ?? 'min-h-[300px] w-full'}>
    <RechartsPieChart>
      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
      <Pie data={data} dataKey={dataKey} nameKey={nameKey}>
        {data.map((entry, index) => {
          const name = (entry as Record<string, unknown>)[nameKey] as string | undefined;
          const fill =
            name && config[name]?.color ? `var(--color-${name})` : `var(--chart-${index + 1})`;
          return <Cell key={`cell-${name ?? index}`} fill={fill} />;
        })}
      </Pie>
      <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />
    </RechartsPieChart>
  </ChartContainer>
);

PieChart.displayName = 'PieChart';
