import { ChartLine } from 'lucide-react';
import type * as React from 'react';
import { cn } from '../../../shadcn/utils';

// Same 100×40 plot and gutter as LineChartSkeleton, so loading, empty and drawn charts share their geometry
const GRID_Y = [4, 14, 24, 34];
const BASELINE_Y = 24;
const X_TICKS = 5;

export interface LineChartEmptyState {
  title: string;
  description?: string;
  /** Replaces the default chart icon; size it `size-4`. */
  icon?: React.ReactNode;
}

interface LineChartEmptyProps extends LineChartEmptyState {
  // The X range the chart would cover; with it a time axis keeps its labels and markers
  xDomain?: [number, number];
  xAxisFormatter?: (value: string | number) => string;
  markers?: { x: number | string; label?: string }[];
  className?: string;
}

// A line chart with nothing to draw: the frame stays — the axis labels across its range, the grid, its markers — and
// an open baseline runs under a quiet note, so the empty state reads as this chart rather than a missing one
export const LineChartEmpty = ({
  title,
  description,
  icon,
  xDomain,
  xAxisFormatter,
  markers,
  className,
}: LineChartEmptyProps) => {
  const [start, end] = xDomain ?? [0, 0];
  const span = end - start;
  const ticks = xDomain && span > 0 ? Array.from({ length: X_TICKS }, (_, index) => start + (span * index) / 4) : [];
  const placed = (markers ?? []).flatMap((marker) => {
    const offset = span > 0 ? ((Number(marker.x) - start) / span) * 100 : Number.NaN;
    return offset >= 0 && offset <= 100 ? [{ ...marker, offset }] : [];
  });

  return (
    <div
      role="img"
      aria-label={description ? `${title}. ${description}` : title}
      className={cn('flex gap-3', className ?? 'min-h-75 w-full')}
    >
      {/* Keeps the value axis gutter a drawn chart has, so nothing shifts when data arrives */}
      <div className="w-12 shrink-0" aria-hidden />
      <div className="flex flex-1 flex-col gap-2">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full text-muted-foreground"
            role="presentation"
          >
            {GRID_Y.map((y) => (
              <line
                key={y}
                x1={0}
                x2={100}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.12}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {placed.map((marker) => (
              <line
                key={String(marker.x)}
                x1={marker.offset}
                x2={marker.offset}
                y1={0}
                y2={40}
                stroke="currentColor"
                strokeOpacity={0.45}
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {/* The open baseline: where a series would run across the range */}
            <line
              x1={0}
              x2={100}
              y1={BASELINE_Y}
              y2={BASELINE_Y}
              stroke="currentColor"
              strokeOpacity={0.35}
              strokeWidth={1.5}
              strokeDasharray="2 4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {placed.map(
            (marker) =>
              marker.label && (
                <span
                  key={String(marker.x)}
                  className="absolute top-0 -translate-x-full pr-1.5 text-xs text-muted-foreground"
                  style={{ left: `${marker.offset}%` }}
                  aria-hidden
                >
                  {marker.label}
                </span>
              ),
          )}

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="flex max-w-xs flex-col items-center gap-2 rounded-lg bg-background px-4 py-3 text-center">
              <span className="flex size-9 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                {icon ?? <ChartLine className="size-4" aria-hidden />}
              </span>
              <p className="text-sm font-medium text-foreground">{title}</p>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
          </div>
        </div>

        <div className="flex min-h-4 justify-between text-xs tabular-nums text-muted-foreground" aria-hidden>
          {ticks.map((tick) => (
            <span key={tick}>{xAxisFormatter ? xAxisFormatter(tick) : tick}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
