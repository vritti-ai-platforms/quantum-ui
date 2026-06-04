import { format, getDaysInMonth, isValid, parse } from 'date-fns';
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

const emptyParts = (): DateParts => ({ day: '', month: '', year: '' });
const digits = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);
const toParts = (date?: Date): DateParts =>
  date ? { day: format(date, 'dd'), month: format(date, 'MM'), year: format(date, 'yyyy') } : emptyParts();

const parseManualDate = ({ day, month, year }: DateParts) => {
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return undefined;
  const next = parse(`${day}/${month}/${year}`, 'dd/MM/yyyy', new Date());
  return isValid(next) && format(next, 'dd/MM/yyyy') === `${day}/${month}/${year}` ? next : undefined;
};

const maxDayForParts = (parts: DateParts, fallback: Date) => {
  const year = parts.year.length === 4 ? Number(parts.year) : fallback.getFullYear();
  const month = parts.month.length > 0 ? Number(parts.month) - 1 : fallback.getMonth();
  const safeMonth = month >= 0 && month < 12 ? month : fallback.getMonth();
  return getDaysInMonth(new Date(year, safeMonth, 1));
};

export interface DateRangePickerProps {
  label?: string;
  description?: React.ReactNode;
  error?: string;
  placeholder?: string;
  value?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  calendarProps?: CalendarProps;
  className?: string;
  id?: string;
  numberOfMonths?: number;
}

export const DateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(
  (
    {
      label,
      description,
      error,
      placeholder = 'Select date range',
      value,
      onValueChange,
      open: controlledOpen,
      onOpenChange,
      calendarProps,
      className,
      id = 'date-range',
      numberOfMonths = 2,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [internalRange, setInternalRange] = useState<DateRange | undefined>(value);
    const [fromDraft, setFromDraft] = useState<DateParts>(() => toParts(value?.from));
    const [toDraft, setToDraft] = useState<DateParts>(() => toParts(value?.to));

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

    useEffect(() => {
      if (value !== undefined) {
        setInternalRange(value);
        setFromDraft(toParts(value.from));
        setToDraft(toParts(value.to));
      }
    }, [value]);

    const displayRange = value !== undefined ? value : internalRange;

    const handleRangeSelect = (range: DateRange | undefined) => {
      setInternalRange(range);
      setFromDraft(toParts(range?.from));
      setToDraft(toParts(range?.to));
      onValueChange?.(range);
      if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
        setOpen(false);
      }
    };

    const commitFromDraft = (parts: DateParts) => {
      setFromDraft(parts);
      const date = parseManualDate(parts);
      const next: DateRange = { from: date, to: displayRange?.to };
      setInternalRange(next);
      onValueChange?.(next);
    };

    const commitToDraft = (parts: DateParts) => {
      setToDraft(parts);
      const date = parseManualDate(parts);
      const next: DateRange = { from: displayRange?.from, to: date };
      setInternalRange(next);
      onValueChange?.(next);
      if (displayRange?.from && date && displayRange.from.getTime() !== date.getTime()) {
        setOpen(false);
      }
    };

    const displayText = (() => {
      if (!displayRange?.from) return undefined;
      if (!displayRange.to) return displayRange.from.toLocaleDateString();
      return `${displayRange.from.toLocaleDateString()} – ${displayRange.to.toLocaleDateString()}`;
    })();

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
              className={cn('w-72 justify-between font-normal', !displayText && 'text-muted-foreground', className)}
              {...props}
            >
              {displayText ?? placeholder}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <div className="border-b p-2">
              <div className="flex items-center justify-center gap-2">
                <div className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1">
                  <Input
                    value={fromDraft.day}
                    placeholder="DD"
                    inputMode="numeric"
                    maxLength={2}
                    className="!h-6 w-10 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                    onChange={(e) => {
                      const day = digits(e.target.value, 2);
                      if (day === '00') return;
                      if (day.length === 2 && (Number(day) < 1 || Number(day) > maxDayForParts(fromDraft, new Date()))) return;
                      commitFromDraft({ ...fromDraft, day });
                    }}
                  />
                  <Input
                    value={fromDraft.month}
                    placeholder="MM"
                    inputMode="numeric"
                    maxLength={2}
                    className="!h-6 w-10 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                    onChange={(e) => {
                      const month = digits(e.target.value, 2);
                      if (month === '00') return;
                      if (month.length === 2 && (Number(month) < 1 || Number(month) > 12)) return;
                      commitFromDraft({ ...fromDraft, month });
                    }}
                  />
                  <Input
                    value={fromDraft.year}
                    placeholder="YYYY"
                    inputMode="numeric"
                    maxLength={4}
                    className="!h-6 w-16 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                    onChange={(e) => commitFromDraft({ ...fromDraft, year: digits(e.target.value, 4) })}
                  />
                </div>
                <span className="text-xs text-muted-foreground">→</span>
                <div className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1">
                  <Input
                    value={toDraft.day}
                    placeholder="DD"
                    inputMode="numeric"
                    maxLength={2}
                    className="!h-6 w-10 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                    onChange={(e) => {
                      const day = digits(e.target.value, 2);
                      if (day === '00') return;
                      if (day.length === 2 && (Number(day) < 1 || Number(day) > maxDayForParts(toDraft, new Date()))) return;
                      commitToDraft({ ...toDraft, day });
                    }}
                  />
                  <Input
                    value={toDraft.month}
                    placeholder="MM"
                    inputMode="numeric"
                    maxLength={2}
                    className="!h-6 w-10 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                    onChange={(e) => {
                      const month = digits(e.target.value, 2);
                      if (month === '00') return;
                      if (month.length === 2 && (Number(month) < 1 || Number(month) > 12)) return;
                      commitToDraft({ ...toDraft, month });
                    }}
                  />
                  <Input
                    value={toDraft.year}
                    placeholder="YYYY"
                    inputMode="numeric"
                    maxLength={4}
                    className="!h-6 w-16 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                    onChange={(e) => commitToDraft({ ...toDraft, year: digits(e.target.value, 4) })}
                  />
                </div>
              </div>
            </div>
            <Calendar
              {...calendarProps}
              mode="range"
              selected={displayRange}
              captionLayout="label"
              numberOfMonths={numberOfMonths}
              onSelect={handleRangeSelect as (range: DateRange | undefined) => void}
            />
          </PopoverContent>
        </Popover>
        {description && !error && <p className="text-sm text-muted-foreground px-1">{description}</p>}
        {error && <p className="text-sm text-destructive px-1">{error}</p>}
      </div>
    );
  },
);

DateRangePicker.displayName = 'DateRangePicker';
