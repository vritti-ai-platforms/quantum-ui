import type { Meta, StoryObj } from '@storybook/react';
import type { ChartConfig } from '../../../shadcn/shadcnChart';
import { RadarChart } from './RadarChart';

const data = [
  { skill: 'Speed', team: 120, baseline: 100 },
  { skill: 'Reliability', team: 98, baseline: 110 },
  { skill: 'Comfort', team: 86, baseline: 130 },
  { skill: 'Safety', team: 99, baseline: 100 },
  { skill: 'Efficiency', team: 85, baseline: 90 },
  { skill: 'Cost', team: 65, baseline: 85 },
];

const config: ChartConfig = {
  team: { label: 'Team', color: 'var(--chart-1)' },
  baseline: { label: 'Baseline', color: 'var(--chart-2)' },
};

const meta: Meta<typeof RadarChart> = {
  title: 'Charts/RadarChart',
  component: RadarChart,
};
export default meta;
type Story = StoryObj<typeof RadarChart>;

export const Default: Story = {
  render: () => (
    <RadarChart data={data} config={config} angleKey="skill" radars={[{ dataKey: 'team' }, { dataKey: 'baseline' }]} />
  ),
};
