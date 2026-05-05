import type { Meta, StoryObj } from '@storybook/react';
import type { ChartConfig } from '../../../shadcn/shadcnChart';
import { RadialChart } from './RadialChart';

const data = [
  { name: 'desktop', value: 275 },
  { name: 'mobile', value: 200 },
  { name: 'tablet', value: 187 },
  { name: 'wearable', value: 120 },
];

const config: ChartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
  tablet: { label: 'Tablet', color: 'var(--chart-3)' },
  wearable: { label: 'Wearable', color: 'var(--chart-4)' },
};

const meta: Meta<typeof RadialChart> = {
  title: 'Charts/RadialChart',
  component: RadialChart,
};
export default meta;
type Story = StoryObj<typeof RadialChart>;

export const Default: Story = {
  render: () => <RadialChart data={data} config={config} dataKey="value" />,
};
