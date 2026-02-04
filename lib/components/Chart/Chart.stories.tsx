import type { Meta, StoryObj } from '@storybook/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './Chart';

const meta: Meta<typeof ChartContainer> = {
  title: 'Components/Chart',
  component: ChartContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const barData = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 214, mobile: 140 },
];

const lineData = [
  { month: 'Jan', value: 400 },
  { month: 'Feb', value: 300 },
  { month: 'Mar', value: 600 },
  { month: 'Apr', value: 800 },
  { month: 'May', value: 500 },
  { month: 'Jun', value: 700 },
];

const pieData = [
  { name: 'Chrome', value: 275, fill: 'var(--chart-1)' },
  { name: 'Safari', value: 200, fill: 'var(--chart-2)' },
  { name: 'Firefox', value: 187, fill: 'var(--chart-3)' },
  { name: 'Edge', value: 173, fill: 'var(--chart-4)' },
  { name: 'Other', value: 90, fill: 'var(--chart-5)' },
];

const barChartConfig: ChartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--chart-2)',
  },
};

const lineChartConfig: ChartConfig = {
  value: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
};

const pieChartConfig: ChartConfig = {
  chrome: { label: 'Chrome', color: 'var(--chart-1)' },
  safari: { label: 'Safari', color: 'var(--chart-2)' },
  firefox: { label: 'Firefox', color: 'var(--chart-3)' },
  edge: { label: 'Edge', color: 'var(--chart-4)' },
  other: { label: 'Other', color: 'var(--chart-5)' },
};

export const BarChartExample: Story = {
  render: () => (
    <ChartContainer config={barChartConfig} className="min-h-[300px] w-[500px]">
      <BarChart data={barData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};

export const LineChartExample: Story = {
  render: () => (
    <ChartContainer config={lineChartConfig} className="min-h-[300px] w-[500px]">
      <LineChart data={lineData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  ),
};

export const AreaChartExample: Story = {
  render: () => (
    <ChartContainer config={lineChartConfig} className="min-h-[300px] w-[500px]">
      <AreaChart data={lineData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.2} />
      </AreaChart>
    </ChartContainer>
  ),
};

export const PieChartExample: Story = {
  render: () => (
    <ChartContainer config={pieChartConfig} className="min-h-[300px] w-[500px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
          {pieData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  ),
};
