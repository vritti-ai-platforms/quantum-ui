import type { Meta, StoryObj } from '@storybook/react';
import type { ChartConfig } from '../../../shadcn/shadcnChart';
import { LineChart } from './LineChart';

const data = [
  { month: 'Jan', revenue: 4200, expenses: 2400 },
  { month: 'Feb', revenue: 3800, expenses: 2100 },
  { month: 'Mar', revenue: 5100, expenses: 2800 },
  { month: 'Apr', revenue: 6200, expenses: 3100 },
  { month: 'May', revenue: 5800, expenses: 2900 },
  { month: 'Jun', revenue: 7400, expenses: 3400 },
];

const config: ChartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  expenses: { label: 'Expenses', color: 'var(--chart-2)' },
};

const meta: Meta<typeof LineChart> = {
  title: 'Charts/LineChart',
  component: LineChart,
};
export default meta;
type Story = StoryObj<typeof LineChart>;

export const Default: Story = {
  render: () => (
    <LineChart data={data} config={config} xAxisKey="month" lines={[{ dataKey: 'revenue' }, { dataKey: 'expenses' }]} />
  ),
};
