import { cn } from '../../../shadcn/utils';
import { stepClassAt } from './steps';

/** One stage named in the key */
export interface SegmentedProgressKeyItem {
  key: string;
  label: string;
}

export interface SegmentedProgressKeyProps {
  /** Stages in the same order as the bar's segments, so each swatch matches its segment's colour */
  items: SegmentedProgressKeyItem[];
  /** Names the track's swatch, listed first as the state before every stage, e.g. "Not allocated" */
  trackLabel?: string;
  className?: string;
}

/**
 * The legend for `SegmentedProgress` — a swatch and a label per stage, coloured by position like the bar. Render it
 * once, e.g. in a column header or above a table.
 */
export function SegmentedProgressKey({ items, trackLabel, className }: SegmentedProgressKeyProps) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground', className)}>
      {trackLabel && (
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 shrink-0 rounded-full bg-progress-track" aria-hidden />
          {trackLabel}
        </li>
      )}
      {items.map((item, position) => (
        <li key={item.key} className="flex items-center gap-1.5">
          <span className={cn('size-2.5 shrink-0 rounded-full', stepClassAt(position))} aria-hidden />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

SegmentedProgressKey.displayName = 'SegmentedProgressKey';
