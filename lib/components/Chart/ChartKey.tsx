import pluralize from 'pluralize-esm';
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Skeleton } from '../Skeleton';
import { CHART_SERIES_COLORS } from './colorSeries';
import type { ChartInstance, ChartSelection, ChartSeries } from './types';

interface ChartKeyProps<TSelection extends ChartSelection> {
  chart: ChartInstance<TSelection>;
  title: string;
  /** A series' figure, shown at the right of its name */
  value?: (series: ChartSeries<TSelection['series'][number]>) => React.ReactNode;
  /** A series' second line, under its name */
  detail?: (series: ChartSeries<TSelection['series'][number]>) => React.ReactNode;
}

const SKELETON_ROWS = ['first', 'second', 'third'];

// A card keying each drawn series by its colour, with a figure and a line of detail per series; skeleton rows while the
// chart loads, nothing when it draws nothing
export function ChartKey<TSelection extends ChartSelection>({
  chart,
  title,
  value,
  detail,
}: ChartKeyProps<TSelection>) {
  const series = chart.view?.series ?? [];
  const hiddenSeries = chart.view?.hiddenSeries ?? 0;
  if (!chart.isLoading && series.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
          {chart.isLoading
            ? SKELETON_ROWS.map((key) => (
                <li key={key} className="flex items-center gap-3">
                  <Skeleton className="size-2.5 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </li>
              ))
            : series.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium text-foreground">{entry.label}</span>
                      {value && (
                        <span className="text-sm font-semibold tabular-nums text-foreground">{value(entry)}</span>
                      )}
                    </div>
                    {detail && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {detail(entry)}
                      </div>
                    )}
                  </div>
                </li>
              ))}
        </ul>
        {!chart.isLoading && hiddenSeries > 0 && (
          <p className="text-xs text-muted-foreground">
            {pluralize('more series', hiddenSeries, true)} not drawn — the chart draws up to{' '}
            {CHART_SERIES_COLORS.length} at once. Narrow the filters to see the rest.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
