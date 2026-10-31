import type { Locale } from 'date-fns';
import { addDays, format, parse, startOfDay } from 'date-fns';
import type React from 'react';
import { useCallback, useRef } from 'react';
import { cn } from '../../../shadcn/utils';

const ISO = 'yyyy-MM-dd';

// Quick picks beneath a calendar — UI only; picking one emits that day's YYYY-MM-DD like any other day
export const RELATIVE_DAYS = [
  { key: 'yesterday', label: 'Yesterday', offset: -1 },
  { key: 'today', label: 'Today', offset: 0 },
  { key: 'tomorrow', label: 'Tomorrow', offset: 1 },
] as const;

export type RelativeDay = (typeof RELATIVE_DAYS)[number];

// The YYYY-MM-DD a quick pick stands for right now
export function resolveRelative(day: RelativeDay): string {
  return format(addDays(startOfDay(new Date()), day.offset), ISO);
}

// The quick pick a YYYY-MM-DD value falls on, if it is yesterday, today or tomorrow
export function relativeDayOf(value: unknown): RelativeDay | undefined {
  return RELATIVE_DAYS.find((day) => resolveRelative(day) === value);
}

interface RelativeDayStripProps {
  // Names the group for assistive tech, e.g. the field's label
  label: string;
  // The selected YYYY-MM-DD, which marks its quick pick as active
  value?: string;
  onPick: (iso: string) => void;
  // Days that cannot be picked, e.g. outside a picker's min/max
  isDisabled?: (date: Date) => boolean;
  locale?: Locale;
}

// Yesterday / Today / Tomorrow beneath a calendar, each with its date; arrow keys move between them like a radio group
export const RelativeDayStrip: React.FC<RelativeDayStripProps> = ({ label, value, onPick, isDisabled, locale }) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const formatOptions = locale ? { locale } : undefined;
  const relative = relativeDayOf(value);
  // Only one option takes the tab stop: the active one, else today
  const tabStop = relative?.key ?? 'today';

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const options = Array.from(
      stripRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)') ?? [],
    );
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    const step = e.key === 'ArrowRight' ? 1 : -1;
    options[(current + step + options.length) % options.length]?.focus();
  }, []);

  return (
    <div
      ref={stripRef}
      role="radiogroup"
      aria-label={`${label} — relative day`}
      onKeyDown={handleKeyDown}
      className="grid grid-cols-3 border-t bg-muted/30"
    >
      {RELATIVE_DAYS.map((day, index) => {
        const iso = resolveRelative(day);
        const date = parse(iso, ISO, new Date());
        const isActive = relative?.key === day.key;
        const disabled = isDisabled?.(date) ?? false;
        return (
          // biome-ignore lint/a11y/useSemanticElements: roving radio buttons styled as a segmented control
          <button
            key={day.key}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            tabIndex={day.key === tabStop ? 0 : -1}
            onClick={() => onPick(iso)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-40',
              index > 0 && 'border-l',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <span className="font-medium">{day.label}</span>
            <span
              className={cn('text-xs tabular-nums', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}
            >
              {format(date, 'd MMM', formatOptions)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
