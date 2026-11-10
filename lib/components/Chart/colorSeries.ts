import type { ChartConfig } from '../../../shadcn/shadcnChart';
import type { ChartSeries, ChartSeriesInput } from './types';

// The chart palette, in the order series take it
export const CHART_SERIES_COLORS = Array.from({ length: 8 }, (_, index) => `var(--chart-series-${index + 1})`);

// The lowest palette slot no series holds; undefined when every colour is taken
function lowestFreeSlot(slots: Map<string, number>): number | undefined {
  const taken = new Set(slots.values());
  const free = CHART_SERIES_COLORS.findIndex((_, slot) => !taken.has(slot));
  return free >= 0 ? free : undefined;
}

// Colours a chart's series. Each series keeps the same palette slot while it stays drawn, so filtering a chart never
// repaints a series that stays; a new series takes the lowest free slot. `slots` remembers who holds what between
// renders and is updated in place.
// - A series with a colour of its own (a status, a generated colour) keeps it and takes no slot.
// - A series past the palette gets no slot and is left out — the caller counts what was left out.
export function colorSeries<TSeries extends ChartSeriesInput>(
  series: TSeries[],
  slots: Map<string, number>,
): ChartSeries<TSeries>[] {
  const drawnIds = new Set(series.map((entry) => entry.id));
  for (const id of [...slots.keys()]) {
    if (!drawnIds.has(id)) slots.delete(id);
  }

  for (const entry of series) {
    if (entry.color || slots.has(entry.id)) continue;
    const slot = lowestFreeSlot(slots);
    if (slot !== undefined) slots.set(entry.id, slot);
  }

  return series.flatMap((entry) => {
    if (entry.color) return [{ ...entry, slot: -1, color: entry.color }];
    const slot = slots.get(entry.id);
    return slot === undefined ? [] : [{ ...entry, slot, color: CHART_SERIES_COLORS[slot] }];
  });
}

// The chart config recharts reads: each series' label and colour, by series id
export function chartConfigOf(series: ChartSeries<ChartSeriesInput>[]): ChartConfig {
  return Object.fromEntries(series.map((entry) => [entry.id, { label: entry.label, color: entry.color }]));
}
