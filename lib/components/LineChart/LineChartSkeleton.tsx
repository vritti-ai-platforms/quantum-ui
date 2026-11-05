import { useId } from 'react';
import { cn } from '../../../shadcn/utils';
import { Skeleton } from '../Skeleton';

// Ghost series in a 100×40 viewBox — alternate ones dashed, as a drawn chart's second encoding would be
const GHOST_LINES = [
  { d: 'M0 26 H16 V22 H38 V23 H61 V17 H79 V19 H100', dashed: false },
  { d: 'M0 32 H24 V30 H49 V31 H72 V26 H100', dashed: true },
  { d: 'M0 13 H20 V15 H44 V10 H67 V12 H100', dashed: false },
];
const GRID_Y = [4, 14, 24, 34];
const X_TICKS = 5;

interface LineChartSkeletonProps {
  // How many ghost lines to sketch, 1–3
  lines: number;
  className?: string;
}

// A line chart loading: faint lines over the grid with a light running along them, and the axes' labels pulsing where
// the real ones land
export const LineChartSkeleton = ({ lines, className }: LineChartSkeletonProps) => {
  const id = useId();
  const maskId = `${id}-lines`;
  const glowId = `${id}-glow`;
  const ghosts = GHOST_LINES.slice(0, Math.min(Math.max(lines, 1), GHOST_LINES.length));

  return (
    <div
      role="status"
      aria-busy
      aria-label="Loading chart"
      className={cn('flex gap-3', className ?? 'min-h-75 w-full')}
    >
      <div className="flex flex-col justify-between py-1" aria-hidden>
        {GRID_Y.map((y, index) => (
          <Skeleton key={y} className="h-3 w-12" style={{ animationDelay: `${index * 80}ms` }} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2" aria-hidden>
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="w-full flex-1 text-muted-foreground"
          role="presentation"
        >
          <defs>
            <linearGradient id={glowId} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="currentColor" stopOpacity="0" />
              <stop offset="0.5" stopColor="currentColor" stopOpacity="0.9" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <mask id={maskId}>
              {ghosts.map((line) => (
                <path
                  key={line.d}
                  d={line.d}
                  fill="none"
                  stroke="white"
                  strokeWidth={4}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </mask>
          </defs>

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

          {ghosts.map((line, index) => (
            <path
              key={line.d}
              d={line.d}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.3}
              strokeWidth={2}
              strokeDasharray={line.dashed ? '6 4' : undefined}
              vectorEffect="non-scaling-stroke"
              className="motion-safe:animate-pulse"
              style={{ animationDelay: `${index * 200}ms` }}
            />
          ))}

          {/* The light only shows where the mask has a line, so it travels along the series rather than the card */}
          <g mask={`url(#${maskId})`} className="motion-reduce:hidden">
            <rect x={-30} y={0} width={30} height={40} fill={`url(#${glowId})`} opacity={0.55}>
              <animate attributeName="x" from="-30" to="100" dur="1.8s" repeatCount="indefinite" />
            </rect>
          </g>
        </svg>
        <div className="flex justify-between">
          {Array.from({ length: X_TICKS }, (_, index) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton ticks
              key={index}
              className="h-3 w-14"
              style={{ animationDelay: `${index * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
