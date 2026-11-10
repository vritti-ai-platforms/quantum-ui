import type { ChartConfig } from '../../../shadcn/shadcnChart';
import type { ContextStateInstance } from '../ContextBar/useContextState';

// A series as `select` names it: `id` keys its values in each row (letters, digits, `-` and `_`), `label` names it
export interface ChartSeriesInput {
  id: string;
  label: string;
  /** A colour of its own — a meaning like a status, or a generated categorical — in place of a palette slot */
  color?: string;
}

// A drawn series, on the colour slot it keeps while it stays drawn (-1 for one with a colour of its own)
export type ChartSeries<TSeries extends ChartSeriesInput> = TSeries & { slot: number; color: string };

// What `select` makes of the data: the rows the chart plots, its series, and whatever else the view needs
export interface ChartSelection<TSeries extends ChartSeriesInput = ChartSeriesInput> {
  rows: Record<string, unknown>[];
  series: TSeries[];
}

// The selection with each drawn series coloured, the chart config built from them, and how many did not fit
export type ChartView<TSelection extends ChartSelection> = Omit<TSelection, 'series'> & {
  series: ChartSeries<TSelection['series'][number]>[];
  config: ChartConfig;
  hiddenSeries: number;
};

export interface ChartInstance<TSelection extends ChartSelection = ChartSelection> {
  view: ChartView<TSelection> | null;
  context: ContextStateInstance;
  /** No data yet, or the data may not answer the context bar yet */
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch?: () => unknown;
}

// How tall a chart's frame is: `tab` fills the screen below a tab's header and context bar, `compact` is a fixed 24rem
export type ChartMode = 'tab' | 'compact';

export interface ChartEmptyState {
  title: string;
  description?: string;
  /** Replaces the default chart icon; size it `size-4`. */
  icon?: React.ReactNode;
}
