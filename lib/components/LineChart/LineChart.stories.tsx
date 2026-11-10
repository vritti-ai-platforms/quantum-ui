import type { Meta, StoryObj } from '@storybook/react';
import { formatCurrency, formatDate } from '../../utils/format';
import { ChartKey } from '../Chart/ChartKey';
import { useChart } from '../Chart/useChart';
import type { LineChartSelection } from './LineChart';
import { LineChart } from './LineChart';

const months = [
  { month: 'Jan', revenue: 4200, expenses: 2400 },
  { month: 'Feb', revenue: 3800, expenses: 2100 },
  { month: 'Mar', revenue: 5100, expenses: 2800 },
  { month: 'Apr', revenue: 6200, expenses: 3100 },
  { month: 'May', revenue: 5800, expenses: 2900 },
  { month: 'Jun', revenue: 7400, expenses: 3400 },
];

const selectMonths = (data: typeof months) => ({
  rows: data,
  series: [
    { id: 'revenue', label: 'Revenue' },
    { id: 'expenses', label: 'Expenses' },
  ],
});

const priceHistory = [
  { date: Date.UTC(2026, 0, 1), price: 120.5 },
  { date: Date.UTC(2026, 1, 15), price: 124 },
  { date: Date.UTC(2026, 3, 1), price: 118.75 },
  { date: Date.UTC(2026, 4, 20), price: null },
  { date: Date.UTC(2026, 6, 1), price: 131.2 },
  { date: Date.UTC(2026, 9, 29), price: 131.2 },
];

type PricePoint = { date: number; price: number | null };

const selectPrices = (data: PricePoint[]): LineChartSelection => ({
  rows: data,
  series: [{ id: 'price', label: 'Unit price' }],
});

const formatPrice = (value: number) => String(formatCurrency({ currency: 'INR', value: String(value) }).primary);
const formatDay = (value: string | number) => String(formatDate(new Date(Number(value)).toISOString()).primary);

const MonthsChart = ({ footnote }: { footnote?: string }) => {
  const chart = useChart({ data: months, select: selectMonths });
  return <LineChart chart={chart} mode="compact" xAxisKey="month" footnote={footnote} />;
};

const PriceChart = ({ data, connectNulls }: { data: PricePoint[]; connectNulls?: boolean }) => {
  const chart = useChart({ data, select: selectPrices });
  return (
    <LineChart
      chart={chart}
      mode="compact"
      xAxisKey="date"
      xAxisType="time"
      curve="stepAfter"
      dot
      showLegend={false}
      connectNulls={connectNulls}
      valueFormatter={formatPrice}
      xAxisFormatter={formatDay}
    />
  );
};

const sharedPriceDomain: [number, number] = [0, 140];
const selectSharedScale = (data: PricePoint[]): LineChartSelection => ({
  ...selectPrices(data),
  yDomain: sharedPriceDomain,
});

const SharedScaleChart = ({ data }: { data: PricePoint[] }) => {
  const chart = useChart({ data, select: selectSharedScale });
  return (
    <LineChart
      chart={chart}
      mode="compact"
      xAxisKey="date"
      xAxisType="time"
      curve="stepAfter"
      dot
      showLegend={false}
      valueFormatter={formatPrice}
      xAxisFormatter={formatDay}
    />
  );
};

const emptyWindow = (): LineChartSelection => ({
  rows: [],
  series: [{ id: 'price', label: 'Unit price' }],
  xDomain: [Date.UTC(2026, 8, 5), Date.UTC(2026, 11, 5)],
  markers: [{ x: Date.UTC(2026, 10, 5), label: 'Today' }],
});

// A request that never answers (loading), answers with nothing (empty), or fails (error)
const STATE_FETCHERS = {
  loading: () => new Promise<PricePoint[]>(() => {}),
  empty: () => Promise.resolve<PricePoint[]>([]),
  error: () => Promise.reject(new Error('Network down')),
};

const StateChart = ({ state }: { state: 'loading' | 'empty' | 'error' }) => {
  const chart = useChart({
    query: { queryKey: ['line-chart-story', state], queryFn: STATE_FETCHERS[state], retry: false },
    select: emptyWindow,
  });
  return (
    <LineChart
      chart={chart}
      mode="compact"
      xAxisKey="date"
      xAxisType="time"
      showLegend={false}
      xAxisFormatter={formatDay}
      emptyState={{
        title: 'No prices in this period',
        description: 'Widen the date range, or add a price on the Prices tab.',
      }}
    />
  );
};

const KeyedChart = () => {
  const chart = useChart({ data: months, select: selectMonths });
  return (
    <div className="flex flex-col gap-4">
      <LineChart chart={chart} mode="compact" xAxisKey="month" showLegend={false} />
      <ChartKey
        chart={chart}
        title="Latest Month"
        value={(series) => String(months[months.length - 1][series.id as 'revenue' | 'expenses'])}
      />
    </div>
  );
};

const meta: Meta = { title: 'Charts/LineChart' };
export default meta;

export const Default: StoryObj = { render: () => <MonthsChart /> };
export const PriceHistory: StoryObj = { render: () => <PriceChart data={priceHistory} /> };
export const PriceHistoryConnectedGaps: StoryObj = { render: () => <PriceChart data={priceHistory} connectNulls /> };
export const SharedYDomain: StoryObj = {
  render: () => (
    <div className="grid w-full grid-cols-2 gap-4">
      <SharedScaleChart
        data={[
          { date: Date.UTC(2026, 0, 1), price: 120.5 },
          { date: Date.UTC(2026, 3, 1), price: 126 },
          { date: Date.UTC(2026, 9, 29), price: 126 },
        ]}
      />
      <SharedScaleChart
        data={[
          { date: Date.UTC(2026, 0, 1), price: 98 },
          { date: Date.UTC(2026, 5, 15), price: 104.25 },
          { date: Date.UTC(2026, 9, 29), price: 104.25 },
        ]}
      />
    </div>
  ),
};
export const Loading: StoryObj = { render: () => <StateChart state="loading" /> };
export const Empty: StoryObj = { render: () => <StateChart state="empty" /> };
export const LoadFailed: StoryObj = { render: () => <StateChart state="error" /> };
export const WithKey: StoryObj = { render: () => <KeyedChart /> };
export const WithFootnote: StoryObj = {
  render: () => (
    <MonthsChart footnote="Revenue is booked on invoice date; expenses on payment date, so a month's margin can lag its sales." />
  ),
};
