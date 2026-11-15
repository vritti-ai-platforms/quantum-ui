import { cn } from '../../../shadcn/utils';
import { formatPercent } from '../../utils/format';
import { getLocale } from '../../utils/locale';
import { Tooltip } from '../Tooltip';
import { stepClassAt } from './steps';

/** One stage of the bar */
export interface SegmentedProgressSegment {
  /** Stable identity of the stage */
  key: string;
  /** Name shown in the tooltip and the accessible summary */
  label: string;
  /** Share of the whole bar, as a percentage (0–100) */
  value: number;
}

export interface SegmentedProgressProps {
  /** Stages in pipeline order — the first is the earliest stage and takes the lightest step; the track is the rest */
  segments: SegmentedProgressSegment[];
  className?: string;
  /** Names the track (the remainder), shown in its tooltip and the accessible summary, e.g. "Not allocated" */
  trackLabel?: string;
  /** Accessible summary; defaults to each drawn segment's label and percentage */
  'aria-label'?: string;
}

function percentText(value: number): string {
  return String(formatPercent(value, { localeTag: getLocale() ?? 'en-US' }).primary);
}

/**
 * A thin multi-stage progress bar: each segment is coloured by its position on the `--progress-step-*` ramp, the neutral
 * track is the remainder, and hovering a segment names it. Pair it with `SegmentedProgressKey`.
 *
 * @example
 * ```tsx
 * <SegmentedProgress
 *   segments={[
 *     { key: 'allocated', label: 'Allocated', value: 20 },
 *     { key: 'ordered', label: 'Ordered', value: 35 },
 *   ]}
 * />
 * ```
 */
export function SegmentedProgress({
  segments,
  className,
  trackLabel,
  'aria-label': ariaLabel,
}: SegmentedProgressProps) {
  const drawn = segments.flatMap((segment, position) =>
    segment.value > 0 ? [{ ...segment, position, text: `${segment.label} · ${percentText(segment.value)}` }] : [],
  );
  const remainder = Math.max(0, 100 - drawn.reduce((total, segment) => total + Math.min(segment.value, 100), 0));
  const parts = [
    ...drawn.map((segment) => `${segment.label} ${percentText(segment.value)}`),
    ...(trackLabel && remainder > 0 ? [`${trackLabel} ${percentText(remainder)}`] : []),
  ];
  const summary = ariaLabel ?? (parts.length > 0 ? parts.join(', ') : 'No progress');
  const track = <span className={cn('h-full min-w-0 flex-1 bg-progress-track', drawn.length > 0 && 'ml-0.5')} />;

  return (
    <div role="img" aria-label={summary} className={cn('flex h-2 w-full overflow-hidden rounded-full', className)}>
      {drawn.map((segment, index) => (
        <Tooltip key={segment.key} content={segment.text}>
          <span
            className={cn('h-full min-w-0.5', index > 0 && 'ml-0.5', stepClassAt(segment.position))}
            style={{ flexBasis: `${Math.min(segment.value, 100)}%` }}
          />
        </Tooltip>
      ))}
      {/* The track is the part left, so a full bar draws none — no gap or notch at its end */}
      {(remainder > 0 || drawn.length === 0) &&
        (trackLabel && remainder > 0 ? (
          <Tooltip content={`${trackLabel} · ${percentText(remainder)}`}>{track}</Tooltip>
        ) : (
          track
        ))}
    </div>
  );
}

SegmentedProgress.displayName = 'SegmentedProgress';
