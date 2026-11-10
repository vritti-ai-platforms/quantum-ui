import type { Meta, StoryObj } from '@storybook/react';
import { useChart } from '../Chart/useChart';
import { RadialChart } from './RadialChart';

const rows = [
  { name: 'desktop', value: 275 },
  { name: 'mobile', value: 200 },
  { name: 'tablet', value: 187 },
  { name: 'wearable', value: 120 },
];

const LABELS: Record<string, string> = { desktop: 'Desktop', mobile: 'Mobile', tablet: 'Tablet', wearable: 'Wearable' };

const selectDevices = (data: typeof rows) => ({
  rows: data,
  series: data.map((row) => ({ id: row.name, label: LABELS[row.name] })),
});

const DevicesChart = () => {
  const chart = useChart({ data: rows, select: selectDevices });
  return <RadialChart chart={chart} mode="compact" dataKey="value" />;
};

const meta: Meta = { title: 'Charts/RadialChart' };
export default meta;

export const Default: StoryObj = { render: () => <DevicesChart /> };
