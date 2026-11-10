import { type QueryKey, skipToken, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import type { FilterCondition } from '../../types/conditions';
import { type ContextStateInstance, useContextState } from '../ContextBar/useContextState';
import { chartConfigOf, colorSeries } from './colorSeries';
import type { ChartInstance, ChartSelection, ChartView } from './types';

// The query options a chart fetches with — the page's query, which `useChart` runs once the context bar has settled
export type ChartQueryOptions<TData, TError = unknown> = UseQueryOptions<TData, TError, TData, QueryKey>;

// What a chart draws: data it fetches (`query`), or data the page already holds (`data`; undefined while it loads)
type ChartSource<TData, TError> =
  | { query: ChartQueryOptions<TData, TError>; data?: never }
  | { data: TData | undefined; query?: never };

type UseChartOptions<TData, TError, TSelection extends ChartSelection> = ChartSource<TData, TError> & {
  /** Turns the data into the chart's rows and series, reading the context bar where it needs to; memoise it — it re-runs
   * when it, the data or the context changes */
  select: (data: TData, context: ContextStateInstance) => TSelection;
  /** Where the chart's context bar is saved; without one the chart has no context bar */
  slug?: string;
  defaultContext?: FilterCondition[];
  resetOnOpen?: string[];
  resets?: Record<string, string[]>;
  /** Called after a context change is saved — the page refetches its data here */
  onStatePush?: () => unknown;
};

// A chart's data, context bar and states: what `<LineChart chart={…}>` and the other charts draw.
// The first request waits until the context bar has settled — loaded, any change saved, every control done checking or
// picking its value — so the server only ever sees a context the controls have confirmed.
export function useChart<TData, TSelection extends ChartSelection, TError = unknown>({
  query: queryOptions,
  data: givenData,
  select,
  slug,
  defaultContext,
  resetOnOpen,
  resets,
  onStatePush,
}: UseChartOptions<TData, TError, TSelection>): ChartInstance<TSelection> {
  const context = useContextState({ slug, defaultContext, resetOnOpen, resets, onStatePush });

  // Once the context has settled for this slug, the query may run; later changes refetch through `onStatePush`
  const slugKey = slug ?? '';
  const [settledSlug, setSettledSlug] = useState<string | null>(null);
  if (!context.isSettling && settledSlug !== slugKey) setSettledSlug(slugKey);
  const hasSettled = settledSlug === slugKey;

  // A chart given its data still calls useQuery (hooks always run), with nothing to fetch
  const noQuery: ChartQueryOptions<TData, TError> = { queryKey: ['use-chart', 'no-query'], queryFn: skipToken };
  const query = useQuery(
    queryOptions ? { ...queryOptions, enabled: hasSettled ? queryOptions.enabled : false } : noQuery,
  );
  const data = queryOptions ? query.data : givenData;

  const selection = useMemo(() => (data === undefined ? null : select(data, context)), [data, select, context]);

  const slots = useRef(new Map<string, number>());
  const view = useMemo((): ChartView<TSelection> | null => {
    if (!selection) return null;
    const series = colorSeries(selection.series, slots.current);
    return {
      ...selection,
      series,
      config: chartConfigOf(series),
      hiddenSeries: selection.series.length - series.length,
    };
  }, [selection]);

  // Loading until the first data arrives, and while the context bar is still settling
  const isFirstLoad = queryOptions ? query.isLoading && data === undefined : data === undefined;
  const isLoading = isFirstLoad || context.isSettling;

  return {
    view,
    context,
    isLoading,
    isFetching: queryOptions ? query.isFetching : false,
    isError: queryOptions ? query.isError : false,
    error: queryOptions ? query.error : null,
    refetch: queryOptions ? query.refetch : undefined,
  };
}
