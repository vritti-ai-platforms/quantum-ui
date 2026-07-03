import { format, getDaysInMonth, isValid, parse, parseISO } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import type React from 'react';
import { forwardRef, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '../../../shadcn/shadcnButton';
import { Calendar, type CalendarProps } from '../../../shadcn/shadcnCalendar';
import { Input } from '../../../shadcn/shadcnInput';
import { Label } from '../../../shadcn/shadcnLabel';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import { cn } from '../../../shadcn/utils';

type DateParts = { day: string; month: string; year: string };

export interface DateTimeRange {
  from?: string;
  to?: string;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DEFAULT_TIME = '00:00';

const emptyParts = (): DateParts => ({ day: '', month: '', year: '' });
const digits = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);

const toParts = (date?: Date): DateParts =>
  date ? { day: format(date, 'dd'), month: format(date, 'MM'), year: format(date, 'yyyy') } : emptyParts();

const parseManualDate = ({ day, month, year }: DateParts): Date | undefined => {
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return undefined;
  const next = parse(`${day}/${month}/${year}`, 'dd/MM/yyyy', new Date());
  return isValid(next) && format(next, 'dd/MM/yyyy') === `${day}/${month}/${year}` ? next : undefined;
};

const maxDayForParts = (parts: DateParts, fallback: Date): number => {
  const year = parts.year.length === 4 ? Number(parts.year) : fallback.getFullYear();
  const month = parts.month.length > 0 ? Number(parts.month) - 1 : fallback.getMonth();
  const safeMonth = month >= 0 && month < 12 ? month : fallback.getMonth();
  return getDaysInMonth(new Date(year, safeMonth, 1));
};

const parseDateTime = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const d = parseISO(value);
  return isValid(d) ? d : undefined;
};

const toTime = (date?: Date): string => {
  if (!date) return DEFAULT_TIME;
  return format(date, 'HH:mm');
};

const withTime = (date: Date, time: string): Date => {
  const safe = TIME_PATTERN.test(time) ? time : DEFAULT_TIME;
  const [h, m] = safe.split(':').map(Number);
  const result = new Date(date);
  result.setHours(h, m, 0, 0);
  return result;
};

const toIso = (date?: Date): string | undefined => date?.toISOString();

const calendarDateOnly = (date?: Date): Date | undefined =>
  date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : undefined;

const formatDisplay = (isoStr?: string): string | undefined => {
  const d = parseDateTime(isoStr);
  if (!d) return undefined;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export interface DateTimeRangePickerProps {
  label?: string;
  description?: React.ReactNode;
  error?: string;
  placeholder?: string;
  value?: DateTimeRange;
  onValueChange?: (range: DateTimeRange | undefined) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  calendarProps?: CalendarProps;
  className?: string;
  id?: string;
  numberOfMonths?: number;
}

export const DateTimeRangePicker = forwardRef<HTMLButtonElement, DateTimeRangePickerProps>(
  (
    {
      label,
      description,
      error,
      placeholder = 'Select date & time range',
      value,
      onValueChange,
      open: controlledOpen,
      onOpenChange,
      calendarProps,
      className,
      id = 'datetime-range',
      numberOfMonths = 2,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [fromDraftParts, setFromDraftParts] = useState<DateParts>(() => toParts(parseDateTime(value?.from)));
    const [toDraftParts, setToDraftParts] = useState<DateParts>(() => toParts(parseDateTime(value?.to)));
    const [fromDraftTime, setFromDraftTime] = useState<string>(() => toTime(parseDateTime(value?.from)));
    const [toDraftTime, setToDraftTime] = useState<string>(() => toTime(parseDateTime(value?.to)));
    const [fromDate, setFromDate] = useState<Date | undefined>(() => parseDateTime(value?.from));
    const [toDate, setToDate] = useState<Date | undefined>(() => parseDateTime(value?.to));

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

    useEffect(() => {
      if (value !== undefined) {
        const nextFrom = parseDateTime(value.from);
        const nextTo = parseDateTime(value.to);
        setFromDate(nextFrom);
        setToDate(nextTo);
        setFromDraftParts(toParts(nextFrom));
        setToDraftParts(toParts(nextTo));
        setFromDraftTime(toTime(nextFrom));
        setToDraftTime(toTime(nextTo));
      }
    }, [value]);

    const emit = (nextFrom?: Date, nextTo?: Date) => {
      onValueChange?.({ from: toIso(nextFrom), to: toIso(nextTo) });
    };

    const calendarRange: DateRange = {
      from: calendarDateOnly(fromDate),
      to: calendarDateOnly(toDate),
    };

    const handleRangeSelect = (range: DateRange | undefined) => {
      const nextFrom = range?.from ? withTime(range.from, fromDraftTime) : undefined;
      const nextTo = range?.to ? withTime(range.to, toDraftTime) : undefined;
      setFromDate(nextFrom);
      setToDate(nextTo);
      setFromDraftParts(toParts(range?.from));
      setToDraftParts(toParts(range?.to));
      emit(nextFrom, nextTo);
      if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
        setOpen(false);
      }
    };

    const commitFrom = (parts: DateParts, time: string) => {
      const date = parseManualDate(parts);
      const next = date ? withTime(date, time) : undefined;
      setFromDate(next);
      emit(next, toDate);
    };

    const commitTo = (parts: DateParts, time: string) => {
      const date = parseManualDate(parts);
      const next = date ? withTime(date, time) : undefined;
      setToDate(next);
      emit(fromDate, next);
      if (fromDate && next && fromDate.getTime() !== next.getTime()) {
        setOpen(false);
      }
    };

    const displayText = value?.from ? `${formatDisplay(value.from)} – ${formatDisplay(value.to) ?? '...'}` : undefined;

    const inputBarClass = 'inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1';
    const segmentClass =
      '!h-6 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs';

    return (
      <div className="flex flex-col gap-3">
        {label && (
          <Label htmlFor={id} className="px-1">
            {label}
          </Label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              id={id}
              aria-invalid={!!error}
              className={cn('w-96 justify-between font-normal', !displayText && 'text-muted-foreground', className)}
              {...props}
            >
              {displayText ?? placeholder}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            {/* Date inputs at top */}
            <div className="border-b p-2">
              <div className="flex items-center justify-center gap-2">
                <div className={inputBarClass}>
                  <Input
                    value={fromDraftParts.day}
                    placeholder="DD"
                    inputMode="numeric"
                    maxLength={2}
                    className={cn(segmentClass, 'w-10')}
                    onChange={(e) => {
                      const day = digits(e.target.value, 2);
                      if (day === '00') return;
                      if (
                        day.length === 2 &&
                        (Number(day) < 1 || Number(day) > maxDayForParts(fromDraftParts, new Date()))
                      )
                        return;
                      const next = { ...fromDraftParts, day };
                      setFromDraftParts(next);
                      commitFrom(next, fromDraftTime);
                    }}
                  />
                  <Input
                    value={fromDraftParts.month}
                    placeholder="MM"
                    inputMode="numeric"
                    maxLength={2}
                    className={cn(segmentClass, 'w-10')}
                    onChange={(e) => {
                      const month = digits(e.target.value, 2);
                      if (month === '00') return;
                      if (month.length === 2 && (Number(month) < 1 || Number(month) > 12)) return;
                      const next = { ...fromDraftParts, month };
                      setFromDraftParts(next);
                      commitFrom(next, fromDraftTime);
                    }}
                  />
                  <Input
                    value={fromDraftParts.year}
                    placeholder="YYYY"
                    inputMode="numeric"
                    maxLength={4}
                    className={cn(segmentClass, 'w-16')}
                    onChange={(e) => {
                      const next = { ...fromDraftParts, year: digits(e.target.value, 4) };
                      setFromDraftParts(next);
                      commitFrom(next, fromDraftTime);
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">→</span>
                <div className={inputBarClass}>
                  <Input
                    value={toDraftParts.day}
                    placeholder="DD"
                    inputMode="numeric"
                    maxLength={2}
                    className={cn(segmentClass, 'w-10')}
                    onChange={(e) => {
                      const day = digits(e.target.value, 2);
                      if (day === '00') return;
                      if (
                        day.length === 2 &&
                        (Number(day) < 1 || Number(day) > maxDayForParts(toDraftParts, new Date()))
                      )
                        return;
                      const next = { ...toDraftParts, day };
                      setToDraftParts(next);
                      commitTo(next, toDraftTime);
                    }}
                  />
                  <Input
                    value={toDraftParts.month}
                    placeholder="MM"
                    inputMode="numeric"
                    maxLength={2}
                    className={cn(segmentClass, 'w-10')}
                    onChange={(e) => {
                      const month = digits(e.target.value, 2);
                      if (month === '00') return;
                      if (month.length === 2 && (Number(month) < 1 || Number(month) > 12)) return;
                      const next = { ...toDraftParts, month };
                      setToDraftParts(next);
                      commitTo(next, toDraftTime);
                    }}
                  />
                  <Input
                    value={toDraftParts.year}
                    placeholder="YYYY"
                    inputMode="numeric"
                    maxLength={4}
                    className={cn(segmentClass, 'w-16')}
                    onChange={(e) => {
                      const next = { ...toDraftParts, year: digits(e.target.value, 4) };
                      setToDraftParts(next);
                      commitTo(next, toDraftTime);
                    }}
                  />
                </div>
              </div>
            </div>
            {/* Calendar */}
            <Calendar
              {...calendarProps}
              mode="range"
              selected={calendarRange}
              captionLayout="label"
              numberOfMonths={numberOfMonths}
              onSelect={handleRangeSelect as (range: DateRange | undefined) => void}
            />
            {/* Time inputs at bottom — matches DateTimePicker style */}
            <div className="border-t p-2">
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">From</span>
                  <Input
                    type="time"
                    step={60}
                    value={fromDraftTime}
                    disabled={!fromDate}
                    className="h-7 w-[112px] appearance-none pr-2 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                    onChange={(e) => {
                      const time = e.target.value;
                      setFromDraftTime(time);
                      commitFrom(fromDraftParts, time);
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">→</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">To</span>
                  <Input
                    type="time"
                    step={60}
                    value={toDraftTime}
                    disabled={!toDate}
                    className="h-7 w-[112px] appearance-none pr-2 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                    onChange={(e) => {
                      const time = e.target.value;
                      setToDraftTime(time);
                      commitTo(toDraftParts, time);
                    }}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {description && !error && <p className="text-sm text-muted-foreground px-1">{description}</p>}
        {error && <p className="text-sm text-destructive px-1">{error}</p>}
      </div>
    );
  },
);

DateTimeRangePicker.displayName = 'DateTimeRangePicker';
