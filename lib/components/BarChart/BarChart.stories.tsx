import type { Meta, StoryObj } from '@storybook/react';
import type { ChartConfig } from '../../../shadcn/shadcnChart';
import { BarChart } from './BarChart';

const data = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 214, mobile: 140 },
];

const config: ChartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
};

const meta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
};
export default meta;
type Story = StoryObj<typeof BarChart>;

export const Default: Story = {
  render: () => (
    <BarChart data={data} config={config} xAxisKey="month" bars={[{ dataKey: 'desktop' }, { dataKey: 'mobile' }]} />
  ),
};
