import { Cell, Pie, PieChart as RechartsPieChart } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shadcn/shadcnChart';
import { useCategoricalColors } from '../../hooks/useCategoricalColors';

export interface PieChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  dataKey: string;
  nameKey: string;
  className?: string;
  // Drops the legend — for a compact pie whose slices are named by the tooltip or the surrounding UI
  hideLegend?: boolean;
  // Turns the pie into a donut; a number is pixels, a string a percentage of the radius (e.g. '60%')
  innerRadius?: number | string;
}

export const PieChart = ({ data, config, dataKey, nameKey, className, hideLegend, innerRadius }: PieChartProps) => {
  const fallbackColors = useCategoricalColors(data.length);
  return (
    <ChartContainer config={config} className={className ?? 'min-h-[300px] w-full'}>
      <RechartsPieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={innerRadius}>
          {data.map((entry, index) => {
            const name = (entry as Record<string, unknown>)[nameKey] as string | undefined;
            // A slice the config doesn't color takes the generated categorical color for its position
            const fill = name && config[name]?.color ? `var(--color-${name})` : fallbackColors[index].background;
            return <Cell key={`cell-${name ?? index}`} fill={fill} />;
          })}
        </Pie>
        {!hideLegend && <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />}
      </RechartsPieChart>
    </ChartContainer>
  );
};

PieChart.displayName = 'PieChart';
