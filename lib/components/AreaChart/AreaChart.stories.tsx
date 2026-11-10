import type { Meta, StoryObj } from '@storybook/react';
import { useChart } from '../Chart/useChart';
import { AreaChart } from './AreaChart';

const rows = [
  { month: 'Jan', visitors: 1200, signups: 320 },
  { month: 'Feb', visitors: 1800, signups: 480 },
  { month: 'Mar', visitors: 2400, signups: 620 },
  { month: 'Apr', visitors: 2100, signups: 540 },
  { month: 'May', visitors: 3200, signups: 780 },
  { month: 'Jun', visitors: 3800, signups: 920 },
];

const selectTraffic = (data: typeof rows) => ({
  rows: data,
  series: [
    { id: 'visitors', label: 'Visitors' },
    { id: 'signups', label: 'Sign-ups' },
  ],
});

const TrafficChart = () => {
  const chart = useChart({ data: rows, select: selectTraffic });
  return <AreaChart chart={chart} mode="compact" xAxisKey="month" />;
};

const meta: Meta = { title: 'Charts/AreaChart' };
export default meta;

export const Default: StoryObj = { render: () => <TrafficChart /> };
