import type { Meta, StoryObj } from '@storybook/react';
import type { ChartConfig } from '../../../shadcn/shadcnChart';
import { AreaChart } from './AreaChart';

const data = [
  { month: 'Jan', visitors: 1200, signups: 320 },
  { month: 'Feb', visitors: 1800, signups: 480 },
  { month: 'Mar', visitors: 2400, signups: 620 },
  { month: 'Apr', visitors: 2100, signups: 540 },
  { month: 'May', visitors: 3200, signups: 780 },
  { month: 'Jun', visitors: 3800, signups: 920 },
];

const config: ChartConfig = {
  visitors: { label: 'Visitors', color: 'var(--chart-1)' },
  signups: { label: 'Signups', color: 'var(--chart-2)' },
};

const meta: Meta<typeof AreaChart> = {
  title: 'Charts/AreaChart',
  component: AreaChart,
};
export default meta;
type Story = StoryObj<typeof AreaChart>;

export const Default: Story = {
  render: () => (
    <AreaChart data={data} config={config} xAxisKey="month" areas={[{ dataKey: 'visitors' }, { dataKey: 'signups' }]} />
  ),
};
