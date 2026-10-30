import { addDays, format, isValid, parse, startOfDay } from 'date-fns';
import { CalendarIcon, ChevronDownIcon, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useId, useRef, useState } from 'react';
import { Calendar } from '../../../shadcn/shadcnCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import { cn } from '../../../shadcn/utils';
import { useLocale } from '../../hooks/useLocale';
import type { FilterCondition } from '../../types/table-filter';
import { CONTEXT_ANCHOR_CLASS, ContextAnchorText, type FilterMode } from '../Select/contextAnchor';

const ISO = 'yyyy-MM-dd';

// Filter values meaning a day relative to the current date: saved as tokens rather than dates, so they never go stale
export const DATE_FILTER_YESTERDAY = 'yesterday';
export const DATE_FILTER_TODAY = 'today';
export const DATE_FILTER_TOMORROW = 'tomorrow';

const RELATIVE_DAYS = [
  { token: DATE_FILTER_YESTERDAY, label: 'Yesterday', offset: -1 },
  { token: DATE_FILTER_TODAY, label: 'Today', offset: 0 },
  { token: DATE_FILTER_TOMORROW, label: 'Tomorrow', offset: 1 },
] as const;

type RelativeDay = (typeof RELATIVE_DAYS)[number];

export interface DateFilterProps {
  name: string;
  label: string;
  value?: FilterCondition | null;
  onChange?: (value: FilterCondition | null | undefined) => void;
  // Clearing returns the filter to today instead of removing it, for a date the data is always read on (an "as of")
  defaultToToday?: boolean;
  /** `filter` (default) is an applied filter chip; `context` is a DataTable context-bar selector — label and value in a
   * quiet outlined trigger, never clearable. */
  mode?: FilterMode;
  className?: string;
}

// Parses a stored YYYY-MM-DD filter value, ignoring anything else
function parseIso(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = parse(value, ISO, new Date());
  return isValid(date) ? date : undefined;
}

// The relative day a stored value names, if it is one of the tokens
function relativeDayOf(value: unknown): RelativeDay | undefined {
  return RELATIVE_DAYS.find((day) => day.token === value);
}

// The calendar date a relative day stands for right now
function resolveRelative(day: RelativeDay): Date {
  return addDays(startOfDay(new Date()), day.offset);
}

// Compact filter chip holding one date — yesterday, today or tomorrow, whether picked from the strip beneath the calendar
// or the calendar itself, kept as tokens that move with the date; any other day is kept as a fixed YYYY-MM-DD
export const DateFilter: React.FC<DateFilterProps> = ({
  name,
  label,
  value,
  onChange,
  defaultToToday,
  mode = 'filter',
  className,
}) => {
  const popoverId = useId();
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const formatOptions = locale ? { locale } : undefined;
  const stripRef = useRef<HTMLDivElement>(null);

  const relative = relativeDayOf(value?.value);
  const selected = relative ? resolveRelative(relative) : parseIso(value?.value);

  const emit = useCallback(
    (next: string) => {
      onChange?.({ field: name, operator: 'equals', value: next });
      setOpen(false);
    },
    [name, onChange],
  );

  // A calendar day that is yesterday, today or tomorrow is kept as that relative day, the same as picking it from the strip
  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      const day = format(date, ISO);
      const match = RELATIVE_DAYS.find((relativeDay) => format(resolveRelative(relativeDay), ISO) === day);
      emit(match ? match.token : day);
    },
    [emit],
  );

  // Clears inline from the chip without opening the popover — back to today when the filter always holds a date
  const handleInlineClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(defaultToToday ? { field: name, operator: 'equals', value: DATE_FILTER_TODAY } : null);
    },
    [defaultToToday, name, onChange],
  );

  // Arrow keys move between the strip's options, as in a radio group
  const handleStripKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const options = Array.from(stripRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []);
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    const step = e.key === 'ArrowRight' ? 1 : -1;
    options[(current + step + options.length) % options.length]?.focus();
  }, []);

  if (!name) {
    return (
      <span className="inline-flex items-center rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">
        DateFilter: missing required `name` prop
      </span>
    );
  }

  const hasValue = selected != null;
  const isContext = mode === 'context';
  // Today has nothing to clear back to when clearing means today; a context selector always holds its date
  const canClear = !isContext && hasValue && !(relative?.token === DATE_FILTER_TODAY && defaultToToday);
  const valueText = relative ? relative.label : hasValue ? format(selected, 'P', formatOptions) : undefined;
  // Only one strip option takes the tab stop: the active one, else today
  const tabStop = relative?.token ?? DATE_FILTER_TODAY;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-controls={popoverId}
          aria-expanded={open}
          className={cn(
            isContext
              ? CONTEXT_ANCHOR_CLASS
              : 'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            !isContext &&
              (hasValue
                ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground'),
            className,
          )}
        >
          <CalendarIcon className={cn('size-3.5 shrink-0', isContext ? 'text-muted-foreground' : 'opacity-70')} />
          {isContext ? (
            <ContextAnchorText label={label} value={valueText} />
          ) : (
            <span className="truncate">{valueText ? `${label}: ${valueText}` : label}</span>
          )}
          {canClear ? (
            <X className="size-3.5 shrink-0 opacity-70 hover:opacity-100" onClick={handleInlineClear} />
          ) : (
            <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent id={popoverId} className="w-auto overflow-hidden p-0" align="start">
        <Calendar mode="single" selected={selected} defaultMonth={selected} onSelect={handleSelect} />
        <div
          ref={stripRef}
          role="radiogroup"
          aria-label={`${label} — relative day`}
          onKeyDown={handleStripKeyDown}
          className="grid grid-cols-3 border-t bg-muted/30"
        >
          {RELATIVE_DAYS.map((day, index) => {
            const isActive = relative?.token === day.token;
            return (
              <button
                key={day.token}
                type="button"
                role="radio"
                aria-checked={isActive}
                tabIndex={day.token === tabStop ? 0 : -1}
                onClick={() => emit(day.token)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                  index > 0 && 'border-l',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <span className="font-medium">{day.label}</span>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                  )}
                >
                  {format(resolveRelative(day), 'd MMM', formatOptions)}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
