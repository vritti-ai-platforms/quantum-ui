import type { Meta, StoryObj } from '@storybook/react';
import { useChart } from '../Chart/useChart';
import { BarChart } from './BarChart';

const rows = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 214, mobile: 140 },
];

const selectDevices = (data: typeof rows) => ({
  rows: data,
  series: [
    { id: 'desktop', label: 'Desktop' },
    { id: 'mobile', label: 'Mobile' },
  ],
});

const DevicesChart = () => {
  const chart = useChart({ data: rows, select: selectDevices });
  return <BarChart chart={chart} mode="compact" xAxisKey="month" />;
};

const meta: Meta = { title: 'Charts/BarChart' };
export default meta;

export const Default: StoryObj = { render: () => <DevicesChart /> };
