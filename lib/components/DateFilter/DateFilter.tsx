import { format, isValid, parse } from 'date-fns';
import { CalendarIcon, ChevronDownIcon, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useId, useState } from 'react';
import { Calendar } from '../../../shadcn/shadcnCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import { cn } from '../../../shadcn/utils';
import { useLocale } from '../../hooks/useLocale';
import type { FilterCondition } from '../../types/table-filter';
import { RELATIVE_DAYS, RelativeDayStrip, relativeDayOf, resolveRelative } from '../DatePicker/RelativeDayStrip';
import { CONTEXT_ANCHOR_CLASS, ContextAnchorText, type FilterMode } from '../Select/contextAnchor';

const ISO = 'yyyy-MM-dd';

// The condition a DateFilter emits — always one YYYY-MM-DD day
export type DateFilterCondition = FilterCondition & { value: string };

interface DateFilterBaseProps {
  name: string;
  label: string;
  // Clearing returns the filter to today instead of removing it, for a date the data is always read on (an "as of")
  defaultToToday?: boolean;
  /** `filter` (default) is an applied filter chip; `context` is a DataTable context-bar selector — label and value in a
   * quiet outlined trigger. */
  mode?: FilterMode;
  className?: string;
}

// `clearable` (independent of `mode`, default `true`) decides whether the filter can be empty: a non-clearable one
// always holds a day, so `value` is required and `onChange` never receives `null`
export type DateFilterProps = DateFilterBaseProps &
  (
    | { clearable?: true; value?: FilterCondition | null; onChange?: (value: DateFilterCondition | null) => void }
    | { clearable: false; value: FilterCondition; onChange?: (value: DateFilterCondition) => void }
  );

// Parses a stored YYYY-MM-DD filter value, ignoring anything else
function parseIso(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = parse(value, ISO, new Date());
  return isValid(date) ? date : undefined;
}

// Compact filter chip holding one date as YYYY-MM-DD — picked from the calendar or the yesterday / today / tomorrow strip
export const DateFilter: React.FC<DateFilterProps> = ({
  name,
  label,
  value,
  onChange: onChangeProp,
  defaultToToday,
  mode = 'filter',
  clearable = true,
  className,
}) => {
  const popoverId = useId();
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const formatOptions = locale ? { locale } : undefined;
  // null is only sent from the inline clear, which renders only when clearable
  const onChange = onChangeProp as ((value: DateFilterCondition | null) => void) | undefined;

  const selected = parseIso(value?.value);
  const relative = relativeDayOf(value?.value);

  const emit = useCallback(
    (next: string) => {
      onChange?.({ field: name, operator: 'equals', value: next });
      setOpen(false);
    },
    [name, onChange],
  );

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (date) emit(format(date, ISO));
    },
    [emit],
  );

  // Clears inline from the chip without opening the popover — back to today when the filter always holds a date
  const handleInlineClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(defaultToToday ? { field: name, operator: 'equals', value: resolveRelative(RELATIVE_DAYS[1]) } : null);
    },
    [defaultToToday, name, onChange],
  );

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
  const canClear = clearable && hasValue && !(relative?.key === 'today' && defaultToToday);
  const valueText = relative ? relative.label : hasValue ? format(selected, 'P', formatOptions) : undefined;

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
        <RelativeDayStrip
          label={label}
          value={typeof value?.value === 'string' ? value.value : undefined}
          onPick={emit}
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  );
};
