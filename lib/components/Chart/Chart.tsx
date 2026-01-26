import {
  ChartContainer as ShadcnChartContainer,
  ChartTooltip as ShadcnChartTooltip,
  ChartTooltipContent as ShadcnChartTooltipContent,
  ChartLegend as ShadcnChartLegend,
  ChartLegendContent as ShadcnChartLegendContent,
  ChartStyle as ShadcnChartStyle,
  useChart as shadcnUseChart,
} from '../../../shadcn/shadcnChart';

export type { ChartConfig } from '../../../shadcn/shadcnChart';

/**
 * ChartContainer component that wraps Recharts charts with theming support.
 *
 * @example
 * ```tsx
 * import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@vritti/quantum-ui/Chart';
 * import { BarChart, Bar, XAxis, YAxis } from 'recharts';
 *
 * const chartConfig = {
 *   desktop: { label: "Desktop", color: "var(--chart-1)" },
 * };
 *
 * <ChartContainer config={chartConfig} className="min-h-[200px]">
 *   <BarChart data={data}>
 *     <XAxis dataKey="month" />
 *     <YAxis />
 *     <ChartTooltip content={<ChartTooltipContent />} />
 *     <Bar dataKey="desktop" fill="var(--color-desktop)" />
 *   </BarChart>
 * </ChartContainer>
 * ```
 */
export const ChartContainer = ShadcnChartContainer;

/**
 * ChartTooltip component - re-export of Recharts Tooltip.
 */
export const ChartTooltip = ShadcnChartTooltip;

/**
 * ChartTooltipContent component with styled tooltip content.
 */
export const ChartTooltipContent = ShadcnChartTooltipContent;

/**
 * ChartLegend component - re-export of Recharts Legend.
 */
export const ChartLegend = ShadcnChartLegend;

/**
 * ChartLegendContent component with styled legend content.
 */
export const ChartLegendContent = ShadcnChartLegendContent;

/**
 * ChartStyle component for dynamic theming.
 */
export const ChartStyle = ShadcnChartStyle;

/**
 * Hook to access chart configuration context.
 */
export const useChart = shadcnUseChart;
