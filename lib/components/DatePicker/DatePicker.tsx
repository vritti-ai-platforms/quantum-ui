import { format, getDaysInMonth, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type React from 'react';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Button } from '../../../shadcn/shadcnButton';
import { Calendar, type CalendarProps } from '../../../shadcn/shadcnCalendar';
import { Input } from '../../../shadcn/shadcnInput';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';

type DatePickerValue = string | undefined;
type DateParts = { day: string; month: string; year: string };

const ISO = 'yyyy-MM-dd';
const MANUAL = 'dd/MM/yyyy';
const DEFAULT_DISPLAY = 'MMMM d, yyyy';

const digits = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);

const parseIso = (value?: string) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const next = parse(value, ISO, new Date());
  return isValid(next) && format(next, ISO) === value ? next : undefined;
};

const parseParts = ({ day, month, year }: DateParts) => {
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return undefined;
  const next = parse(`${day}/${month}/${year}`, MANUAL, new Date());
  return isValid(next) && format(next, MANUAL) === `${day}/${month}/${year}` ? next : undefined;
};

const previewFromParts = (parts: DateParts, fallbackMonth: Date) => {
  const year = parts.year.length > 0 ? Number(parts.year) : fallbackMonth.getFullYear();
  const month = parts.month.length > 0 ? Number(parts.month) : fallbackMonth.getMonth() + 1;
  const day = parts.day.length > 0 ? Number(parts.day) : NaN;

  if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12) return undefined;
  if (!Number.isInteger(day) || day < 1) return undefined;

  const max = getDaysInMonth(new Date(year, month - 1, 1));
  if (day > max) return undefined;

  const next = new Date(year, month - 1, day);
  return isValid(next) ? next : undefined;
};

const toParts = (date?: Date): DateParts => ({
  day: date ? format(date, 'dd') : '',
  month: date ? format(date, 'MM') : '',
  year: date ? format(date, 'yyyy') : '',
});

export interface DatePickerProps {
  name?: string;
  label?: string;
  description?: React.ReactNode;
  error?: string;
  placeholder?: string;
  value?: DatePickerValue;
  onValueChange?: (value: string | undefined) => void;
  onChange?: (value: string | undefined) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  calendarProps?: CalendarProps;
  className?: string;
  id?: string;
  onBlur?: () => void;
  disabled?: boolean;
  disableInput?: boolean;
  displayFormat?: string;
  displatFormat?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      description,
      error,
      placeholder = 'Select date',
      value,
      onValueChange,
      onChange,
      open: controlledOpen,
      onOpenChange,
      calendarProps,
      className,
      id,
      onBlur,
      disabled,
      displayFormat,
      displatFormat,
      ...props
    },
    ref,
  ) => {
    const anchorDisplayFormat = displatFormat ?? displayFormat ?? DEFAULT_DISPLAY;
    const controlled = value !== undefined;
    const today = useMemo(() => new Date(), []);
    const initial = parseIso(value) ?? today;
    const [open, setOpenState] = useState(false);
    const [date, setDate] = useState<Date | undefined>(initial);
    const [month, setMonth] = useState<Date>(initial);
    const [draftDate, setDraftDate] = useState<Date | undefined>(initial);
    const [parts, setParts] = useState<DateParts>(toParts(initial));
    const setOpen = controlledOpen !== undefined ? (onOpenChange ?? (() => {})) : setOpenState;
    const isOpen = controlledOpen !== undefined ? controlledOpen : open;
    const selected = controlled ? parseIso(value) : date;
    const calendarSelected = draftDate ?? selected;
    const inputId = id ?? props.name ?? 'date';

    useEffect(() => {
      if (!controlled) return;
      const next = parseIso(value);
      setDate(next);
      if (next) setMonth(next);
      setDraftDate(next);
      setParts(toParts(next));
    }, [controlled, value]);

    const emit = (next?: Date) => {
      const iso = next ? format(next, ISO) : undefined;
      onValueChange?.(iso);
      onChange?.(iso);
    };

    const applyDate = (next?: Date) => {
      if (!controlled) setDate(next);
      if (next) setMonth(next);
      setDraftDate(next);
      setParts(toParts(next));
      emit(next);
    };

    const syncParts = (next: DateParts) => {
      if (!next.day && !next.month && !next.year) return applyDate(undefined);

      const y = Number(next.year);
      const m = Number(next.month);
      if (next.year.length === 4 && y >= 1 && y <= 9999) {
        setMonth(new Date(y, m >= 1 && m <= 12 ? m - 1 : month.getMonth(), 1));
      } else if (next.month.length > 0 && m >= 1 && m <= 12) {
        setMonth(new Date(month.getFullYear(), m - 1, 1));
      }

      setDraftDate(previewFromParts(next, month));

      const parsed = parseParts(next);
      if (parsed) applyDate(parsed);
    };

    const maxDay = (monthValue: string, yearValue: string) => {
      const year = yearValue.length === 4 ? Number(yearValue) : month.getFullYear();
      const monthIndex = monthValue.length > 0 ? Number(monthValue) - 1 : month.getMonth();
      const safeMonth = monthIndex >= 0 && monthIndex < 12 ? monthIndex : month.getMonth();
      return getDaysInMonth(new Date(year, safeMonth, 1));
    };

    return (
      <Field data-disabled={disabled}>
        {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            value={selected ? format(selected, anchorDisplayFormat) : ''}
            disabled={disabled}
            readOnly
            aria-invalid={!!error}
            placeholder={placeholder}
            className={`pr-10 ${className ?? ''}`.trim()}
            onClick={() => !disabled && setOpen(true)}
            onBlur={() => onBlur?.()}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(true);
              }
            }}
            {...props}
          />
          <div className="absolute inset-y-0 right-1 flex items-center">
            <Popover open={isOpen} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                  disabled={disabled}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <CalendarIcon />
                  <span className="sr-only">Select date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="end" sideOffset={10}>
                <div className="border-b p-2">
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1">
                      <Input
                        value={parts.day}
                        placeholder="DD"
                        inputMode="numeric"
                        maxLength={2}
                        className="!h-6 w-10 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                        onChange={(e) => {
                          const v = digits(e.target.value, 2);
                          if (v === '00') return;
                          if (v.length === 2) {
                            const n = Number(v);
                            if (n < 1 || n > maxDay(parts.month, parts.year)) return;
                          }
                          const next = { ...parts, day: v };
                          setParts(next);
                          syncParts(next);
                        }}
                      />
                      <Input
                        value={parts.month}
                        placeholder="MM"
                        inputMode="numeric"
                        maxLength={2}
                        className="!h-6 w-10 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                        onChange={(e) => {
                          const v = digits(e.target.value, 2);
                          if (v === '00') return;
                          if (v.length === 2) {
                            const n = Number(v);
                            if (n < 1 || n > 12) return;
                          }
                          let day = parts.day;
                          if (day.length === 2) {
                            const capped = Math.min(Number(day), maxDay(v, parts.year));
                            day = String(capped).padStart(2, '0');
                          }
                          const next = { ...parts, day, month: v };
                          setParts(next);
                          syncParts(next);
                        }}
                      />
                      <Input
                        value={parts.year}
                        placeholder="YYYY"
                        inputMode="numeric"
                        maxLength={4}
                        className="!h-6 w-16 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                        onChange={(e) => {
                          const next = { ...parts, year: digits(e.target.value, 4) };
                          setParts(next);
                          syncParts(next);
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') return;
                          e.preventDefault();
                          syncParts(parts);
                          setOpen(false);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Calendar
                  {...calendarProps}
                  mode="single"
                  captionLayout="label"
                  month={month}
                  onMonthChange={(nextMonth) => {
                    setMonth(nextMonth);
                    setParts((prev) => ({
                      ...prev,
                      month: format(nextMonth, 'MM'),
                      year: format(nextMonth, 'yyyy'),
                    }));
                  }}
                  selected={calendarSelected}
                  onSelect={(next) => {
                    applyDate(next);
                    onBlur?.();
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

DatePicker.displayName = 'DatePicker';
