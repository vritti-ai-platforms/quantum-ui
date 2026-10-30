import type { Meta, StoryObj } from '@storybook/react';
import type { ChartConfig } from '../../../shadcn/shadcnChart';
import { formatCurrency, formatDate } from '../../utils/format';
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

const priceHistory = [
  { date: Date.UTC(2026, 0, 1), price: 120.5 },
  { date: Date.UTC(2026, 1, 15), price: 124 },
  { date: Date.UTC(2026, 3, 1), price: 118.75 },
  { date: Date.UTC(2026, 4, 20), price: null },
  { date: Date.UTC(2026, 6, 1), price: 131.2 },
  { date: Date.UTC(2026, 9, 29), price: 131.2 },
];

const priceConfig: ChartConfig = {
  price: { label: 'Unit price', color: 'var(--chart-1)' },
};

const formatPrice = (value: number) => String(formatCurrency({ currency: 'INR', value: String(value) }).primary);
const formatDay = (value: string | number) => String(formatDate(new Date(Number(value)).toISOString()).primary);

export const PriceHistory: Story = {
  render: () => (
    <LineChart
      data={priceHistory}
      config={priceConfig}
      xAxisKey="date"
      lines={[{ dataKey: 'price', type: 'stepAfter', dot: true }]}
      valueFormatter={formatPrice}
      xAxisFormatter={formatDay}
      xAxisType="time"
      showLegend={false}
    />
  ),
};

export const PriceHistoryConnectedGaps: Story = {
  render: () => (
    <LineChart
      data={priceHistory}
      config={priceConfig}
      xAxisKey="date"
      lines={[{ dataKey: 'price', type: 'stepAfter', dot: true }]}
      valueFormatter={formatPrice}
      xAxisFormatter={formatDay}
      xAxisType="time"
      showLegend={false}
      connectNulls
    />
  ),
};

const supplierAPrices = [
  { date: Date.UTC(2026, 0, 1), price: 120.5 },
  { date: Date.UTC(2026, 3, 1), price: 126 },
  { date: Date.UTC(2026, 9, 29), price: 126 },
];

const supplierBPrices = [
  { date: Date.UTC(2026, 0, 1), price: 98 },
  { date: Date.UTC(2026, 5, 15), price: 104.25 },
  { date: Date.UTC(2026, 9, 29), price: 104.25 },
];

const sharedPriceDomain: [number, number] = [0, 140];

export const SharedYDomain: Story = {
  render: () => (
    <div className="grid w-full grid-cols-2 gap-4">
      {[
        { supplier: 'supplier-a', prices: supplierAPrices },
        { supplier: 'supplier-b', prices: supplierBPrices },
      ].map(({ supplier, prices }) => (
        <LineChart
          key={supplier}
          data={prices}
          config={priceConfig}
          xAxisKey="date"
          lines={[{ dataKey: 'price', type: 'stepAfter', dot: true }]}
          valueFormatter={formatPrice}
          xAxisFormatter={formatDay}
          xAxisType="time"
          showLegend={false}
          yDomain={sharedPriceDomain}
        />
      ))}
    </div>
  ),
};
