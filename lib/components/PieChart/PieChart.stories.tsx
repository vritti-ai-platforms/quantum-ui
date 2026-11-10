import type { Meta, StoryObj } from '@storybook/react';
import { useChart } from '../Chart/useChart';
import { PieChart } from './PieChart';

const rows = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
  { browser: 'other', visitors: 90 },
];

const LABELS: Record<string, string> = {
  chrome: 'Chrome',
  safari: 'Safari',
  firefox: 'Firefox',
  edge: 'Edge',
  other: 'Other',
};

const selectBrowsers = (data: typeof rows) => ({
  rows: data,
  series: data.map((row) => ({ id: row.browser, label: LABELS[row.browser] })),
});

const BrowsersChart = ({ innerRadius }: { innerRadius?: string }) => {
  const chart = useChart({ data: rows, select: selectBrowsers });
  return <PieChart chart={chart} mode="compact" dataKey="visitors" nameKey="browser" innerRadius={innerRadius} />;
};

const meta: Meta = { title: 'Charts/PieChart' };
export default meta;

export const Default: StoryObj = { render: () => <BrowsersChart /> };
export const Donut: StoryObj = { render: () => <BrowsersChart innerRadius="60%" /> };
