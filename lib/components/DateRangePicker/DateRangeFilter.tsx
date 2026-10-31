import { addMonths, format, isBefore, isValid, max, parse, startOfMonth } from 'date-fns';
import { CalendarIcon, ChevronDownIcon, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useId, useState } from 'react';
import type { DateRange, Matcher } from 'react-day-picker';
import { Calendar } from '../../../shadcn/shadcnCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import { cn } from '../../../shadcn/utils';
import { useLocale } from '../../hooks/useLocale';
import type { FilterCondition } from '../../types/table-filter';
import { CONTEXT_ANCHOR_CLASS, ContextAnchorText, type FilterMode } from '../Select/contextAnchor';

const ISO = 'yyyy-MM-dd';

// The condition a DateRangeFilter emits — always a `between` over a `[from, to]` pair of YYYY-MM-DD strings, both ends
// inclusive
export type DateRangeFilterCondition = FilterCondition & { value: [string, string] };

interface DateRangeFilterBaseProps {
  name: string;
  label: string;
  /** `filter` (default) is an applied filter chip; `context` is a DataTable context-bar selector — label and range in a
   * quiet outlined trigger. */
  mode?: FilterMode;
  /** How many months the calendar shows side by side. Defaults to `2`. */
  numberOfMonths?: number;
  /** The earliest day that can be picked */
  minDate?: Date;
  /** The latest day that can be picked */
  maxDate?: Date;
  /** Shown in the context trigger while no range is applied */
  placeholder?: string;
  className?: string;
}

// `clearable` (independent of `mode`, default `true`) decides whether the filter can be empty: a non-clearable one
// always holds a range, so `value` is required and `onChange` never receives `null`. `onChange` fires only once both
// ends are picked.
export type DateRangeFilterProps = DateRangeFilterBaseProps &
  (
    | {
        clearable?: true;
        value?: FilterCondition | null;
        onChange?: (value: DateRangeFilterCondition | null) => void;
      }
    | { clearable: false; value: FilterCondition; onChange?: (value: DateRangeFilterCondition) => void }
  );

// Parses one stored YYYY-MM-DD end of the range, ignoring anything else
function parseIso(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = parse(value, ISO, new Date());
  return isValid(date) ? date : undefined;
}

// Reads a stored [from, to] filter value; a range missing either end counts as no range
function parseRange(value: unknown): { from: Date; to: Date } | undefined {
  if (!Array.isArray(value) || value.length !== 2) return undefined;
  const from = parseIso(value[0]);
  const to = parseIso(value[1]);
  return from && to ? { from, to } : undefined;
}

// The first month the calendar opens on: the one that keeps the range's end in view without hiding its start
function openingMonth(range: { from: Date; to: Date } | undefined, numberOfMonths: number): Date | undefined {
  if (!range) return undefined;
  return max([startOfMonth(range.from), startOfMonth(addMonths(range.to, -(numberOfMonths - 1)))]);
}

// Compact filter chip holding a date range as a YYYY-MM-DD pair — applied only once both ends are picked
export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  name,
  label,
  value,
  onChange: onChangeProp,
  mode = 'filter',
  clearable = true,
  numberOfMonths = 2,
  minDate,
  maxDate,
  placeholder,
  className,
}) => {
  const popoverId = useId();
  const [open, setOpen] = useState(false);
  // null is only sent from the inline clear, which renders only when clearable
  const onChange = onChangeProp as ((value: DateRangeFilterCondition | null) => void) | undefined;
  // The range being picked inside the popover; the applied value only changes once it has both ends
  const [draft, setDraft] = useState<DateRange | undefined>(undefined);
  const locale = useLocale();
  const formatOptions = locale ? { locale } : undefined;

  const applied = parseRange(value?.value);

  // A half-picked range is abandoned when the popover closes, so reopening starts from the applied range again
  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setDraft(undefined);
  }, []);

  // The first click starts a fresh range; the second completes it (in either order) and applies it
  const handleSelect = useCallback(
    (_range: DateRange | undefined, picked: Date) => {
      const start = draft?.from && !draft.to ? draft.from : undefined;
      if (!start) {
        setDraft({ from: picked, to: undefined });
        return;
      }
      const [from, to] = isBefore(picked, start) ? [picked, start] : [start, picked];
      onChange?.({ field: name, operator: 'between', value: [format(from, ISO), format(to, ISO)] });
      handleOpenChange(false);
    },
    [draft, name, onChange, handleOpenChange],
  );

  // Clears inline from the chip without opening the popover
  const handleInlineClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
    },
    [onChange],
  );

  if (!name) {
    return (
      <span className="inline-flex items-center rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">
        DateRangeFilter: missing required `name` prop
      </span>
    );
  }

  const hasValue = applied != null;
  const isContext = mode === 'context';
  const canClear = clearable && hasValue;
  const formatDay = (date: Date) => format(date, 'P', formatOptions);
  const valueText = applied ? `${formatDay(applied.from)} – ${formatDay(applied.to)}` : undefined;
  // Days outside the allowed window can't be picked; the matchers compare whole days, ignoring the time of day
  const disabledDays: Matcher[] = [];
  if (minDate) disabledDays.push({ before: minDate });
  if (maxDate) disabledDays.push({ after: maxDate });
  // The calendar shows the draft while one is being picked, else the applied range
  const shown: DateRange | undefined = draft ?? applied;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
            <ContextAnchorText label={label} value={valueText} placeholder={placeholder} />
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
        <Calendar
          mode="range"
          selected={shown}
          defaultMonth={openingMonth(applied, numberOfMonths)}
          numberOfMonths={numberOfMonths}
          startMonth={minDate}
          endMonth={maxDate}
          disabled={disabledDays.length > 0 ? disabledDays : undefined}
          onSelect={handleSelect}
        />
        <div
          aria-live="polite"
          className="flex items-center justify-center gap-2 border-t bg-muted/30 px-3 py-2 text-sm tabular-nums"
        >
          <span className={cn(shown?.from ? 'font-medium text-foreground' : 'text-muted-foreground')}>
            {shown?.from ? formatDay(shown.from) : 'Start date'}
          </span>
          <span className="text-muted-foreground">–</span>
          <span className={cn(shown?.to ? 'font-medium text-foreground' : 'text-muted-foreground')}>
            {shown?.to ? formatDay(shown.to) : 'End date'}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
};
