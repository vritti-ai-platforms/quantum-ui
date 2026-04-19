import {
  format,
  getDaysInMonth,
  isAfter,
  isBefore,
  isValid,
  max as latestDate,
  min as earliestDate,
  parse,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type React from 'react';
import { forwardRef, useEffect, useState } from 'react';
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
const objectWithHasOwn = Object as ObjectConstructor & { hasOwn(target: object, key: PropertyKey): boolean };

const emptyParts = (): DateParts => ({ day: '', month: '', year: '' });
const digits = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);
const hasValueProp = (props: object, key: string) => objectWithHasOwn.hasOwn(props, key);
const parseIso = (value?: string) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const next = parse(value, ISO, new Date());
  return isValid(next) && format(next, ISO) === value ? next : undefined;
};
const toParts = (date?: Date): DateParts =>
  date
    ? {
        day: format(date, 'dd'),
        month: format(date, 'MM'),
        year: format(date, 'yyyy'),
      }
    : emptyParts();
const toIso = (date?: Date) => (date ? format(date, ISO) : undefined);

const parseManualDate = ({ day, month, year }: DateParts) => {
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return undefined;
  const next = parse(`${day}/${month}/${year}`, MANUAL, new Date());
  return isValid(next) && format(next, MANUAL) === `${day}/${month}/${year}` ? next : undefined;
};

const previewManualDate = (parts: DateParts, fallbackMonth: Date) => {
  const year = parts.year ? Number(parts.year) : fallbackMonth.getFullYear();
  const month = parts.month ? Number(parts.month) : fallbackMonth.getMonth() + 1;
  const day = parts.day ? Number(parts.day) : Number.NaN;

  if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12) return undefined;
  if (!Number.isInteger(day) || day < 1) return undefined;

  const maxDay = getDaysInMonth(new Date(year, month - 1, 1));
  if (day > maxDay) return undefined;

  const next = new Date(year, month - 1, day);
  return isValid(next) ? next : undefined;
};

const latest = (dates: Array<Date | undefined>) => {
  const values = dates.filter((value): value is Date => !!value);
  return values.length > 0 ? latestDate(values) : undefined;
};

const earliest = (dates: Array<Date | undefined>) => {
  const values = dates.filter((value): value is Date => !!value);
  return values.length > 0 ? earliestDate(values) : undefined;
};

const isWithinDayBounds = (date: Date, minDay?: Date, maxDay?: Date) =>
  (!minDay || !isBefore(startOfDay(date), minDay)) && (!maxDay || !isAfter(startOfDay(date), maxDay));

const visibleMonthFromParts = (parts: DateParts, fallbackMonth: Date) => {
  const hasYear = parts.year.length === 4;
  const hasMonth = parts.month.length > 0;

  if (!hasYear && !hasMonth) return fallbackMonth;

  const year = hasYear ? Number(parts.year) : fallbackMonth.getFullYear();
  const month = hasMonth ? Number(parts.month) : fallbackMonth.getMonth() + 1;

  if (!Number.isInteger(year) || year < 1 || year > 9999) return fallbackMonth;
  if (!Number.isInteger(month) || month < 1 || month > 12) return new Date(year, fallbackMonth.getMonth(), 1);

  return new Date(year, month - 1, 1);
};

const clampMonth = (month: Date, minDay?: Date, maxDay?: Date) => {
  const monthStart = startOfMonth(month);
  const minMonth = minDay ? startOfMonth(minDay) : undefined;
  const maxMonth = maxDay ? startOfMonth(maxDay) : undefined;

  if (minMonth && minDay && isBefore(monthStart, minMonth)) return minDay;
  if (maxMonth && maxDay && isAfter(monthStart, maxMonth)) return maxDay;
  return month;
};

const maxDayForParts = (parts: DateParts, fallbackMonth: Date) => {
  const year = parts.year.length === 4 ? Number(parts.year) : fallbackMonth.getFullYear();
  const month = parts.month.length > 0 ? Number(parts.month) - 1 : fallbackMonth.getMonth();
  const safeMonth = month >= 0 && month < 12 ? month : fallbackMonth.getMonth();
  return getDaysInMonth(new Date(year, safeMonth, 1));
};

const mergeDisabledMatchers = (
  disabled: CalendarProps['disabled'],
  minDay?: Date,
  maxDay?: Date,
): CalendarProps['disabled'] => {
  const matchers = disabled ? (Array.isArray(disabled) ? [...disabled] : [disabled]) : [];
  if (minDay) matchers.push({ before: minDay });
  if (maxDay) matchers.push({ after: maxDay });
  return matchers.length > 0 ? matchers : undefined;
};

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
  minDate?: Date;
  maxDate?: Date;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>((rawProps, ref) => {
  const controlled = hasValueProp(rawProps, 'value');
  const openControlled = hasValueProp(rawProps, 'open');
  const {
    label,
    description,
    error,
    placeholder = 'Select date',
    value,
    onValueChange,
    onChange,
    open: openProp,
    onOpenChange,
    calendarProps,
    className,
    id,
    onBlur,
    disabled,
    disableInput = true,
    displayFormat,
    displatFormat,
    minDate,
    maxDate,
    ...props
  } = rawProps;

  const anchorDisplayFormat = displatFormat ?? displayFormat ?? DEFAULT_DISPLAY;
  const parsedValue = parseIso(value);
  const minDay = minDate ? startOfDay(minDate) : undefined;
  const maxDay = maxDate ? startOfDay(maxDate) : undefined;
  const {
    mode: _calendarMode,
    month: _calendarMonth,
    onMonthChange: calendarOnMonthChange,
    startMonth: calendarStartMonth,
    endMonth: calendarEndMonth,
    disabled: calendarDisabledProp,
    captionLayout: _calendarCaptionLayout,
    ...calendarRestProps
  } = calendarProps ?? {};

  const [localValue, setLocalValue] = useState<Date | undefined>(parsedValue);
  const [openState, setOpenState] = useState(false);
  const [month, setMonth] = useState<Date>(() => clampMonth(parsedValue ?? minDay ?? maxDay ?? new Date(), minDay, maxDay));
  const [draftParts, setDraftParts] = useState<DateParts>(() => toParts(parsedValue));

  const parsedValueTime = parsedValue?.getTime() ?? null;
  const minDayTime = minDay?.getTime() ?? null;
  const maxDayTime = maxDay?.getTime() ?? null;
  const selected = controlled ? parsedValue : localValue;
  const selectedTime = selected?.getTime() ?? null;
  const selectedPreview = previewManualDate(draftParts, month);
  const calendarSelected = selectedPreview && isWithinDayBounds(selectedPreview, minDay, maxDay) ? selectedPreview : selected;
  const inputId = id ?? props.name ?? 'date';
  const startMonth = latest([minDay, calendarStartMonth]);
  const endMonth = earliest([maxDay, calendarEndMonth]);
  const calendarDisabled = mergeDisabledMatchers(calendarDisabledProp, minDay, maxDay);
  const isOpen = openControlled ? openProp : openState;
  const setOpen = openControlled ? (onOpenChange ?? (() => {})) : setOpenState;

  useEffect(() => {
    if (!controlled) return;
    const next = parsedValueTime === null ? undefined : new Date(parsedValueTime);
    const nextMinDay = minDayTime === null ? undefined : new Date(minDayTime);
    const nextMaxDay = maxDayTime === null ? undefined : new Date(maxDayTime);
    setDraftParts(toParts(next));
    setMonth((currentMonth) => (next ? next : clampMonth(currentMonth, nextMinDay, nextMaxDay)));
  }, [controlled, parsedValueTime, minDayTime, maxDayTime]);

  useEffect(() => {
    if (selectedTime !== null) return;
    const nextMinDay = minDayTime === null ? undefined : new Date(minDayTime);
    const nextMaxDay = maxDayTime === null ? undefined : new Date(maxDayTime);
    setMonth((currentMonth) => clampMonth(currentMonth, nextMinDay, nextMaxDay));
  }, [selectedTime, minDayTime, maxDayTime]);

  const emit = (next?: Date) => {
    const iso = toIso(next);
    onValueChange?.(iso);
    onChange?.(iso);
  };

  const commit = (next?: Date) => {
    if (!controlled) setLocalValue(next);
    setDraftParts(toParts(next));
    setMonth((currentMonth) => (next ? next : clampMonth(currentMonth, minDay, maxDay)));
    emit(next);
  };

  const updateDraftDate = (nextParts: DateParts) => {
    setDraftParts(nextParts);

    const nextMonth = clampMonth(visibleMonthFromParts(nextParts, month), minDay, maxDay);
    if (nextMonth.getTime() !== month.getTime()) setMonth(nextMonth);

    if (!nextParts.day && !nextParts.month && !nextParts.year) {
      commit(undefined);
      return;
    }

    const parsedDate = parseManualDate(nextParts);
    if (!parsedDate || !isWithinDayBounds(parsedDate, minDay, maxDay)) return;

    commit(parsedDate);
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
            if (e.key !== 'ArrowDown') return;
            e.preventDefault();
            setOpen(true);
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
              {!disableInput && (
                <div className="border-b p-2">
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1">
                      <Input
                        value={draftParts.day}
                        placeholder="DD"
                        inputMode="numeric"
                        maxLength={2}
                        className="!h-6 w-10 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                        onChange={(e) => {
                          const day = digits(e.target.value, 2);
                          if (day === '00') return;
                          if (day.length === 2) {
                            const nextDay = Number(day);
                            if (nextDay < 1 || nextDay > maxDayForParts(draftParts, month)) return;
                          }
                          updateDraftDate({ ...draftParts, day });
                        }}
                      />
                      <Input
                        value={draftParts.month}
                        placeholder="MM"
                        inputMode="numeric"
                        maxLength={2}
                        className="!h-6 w-10 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                        onChange={(e) => {
                          const monthValue = digits(e.target.value, 2);
                          if (monthValue === '00') return;
                          if (monthValue.length === 2) {
                            const nextMonth = Number(monthValue);
                            if (nextMonth < 1 || nextMonth > 12) return;
                          }

                          let day = draftParts.day;
                          if (day.length === 2) {
                            const cappedDay = Math.min(Number(day), maxDayForParts({ ...draftParts, month: monthValue }, month));
                            day = String(cappedDay).padStart(2, '0');
                          }

                          updateDraftDate({ ...draftParts, day, month: monthValue });
                        }}
                      />
                      <Input
                        value={draftParts.year}
                        placeholder="YYYY"
                        inputMode="numeric"
                        maxLength={4}
                        className="!h-6 w-16 rounded-md border-transparent bg-background px-1.5 py-0 text-center text-xs font-semibold shadow-xs"
                        onChange={(e) => updateDraftDate({ ...draftParts, year: digits(e.target.value, 4) })}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') return;
                          e.preventDefault();
                          updateDraftDate(draftParts);
                          setOpen(false);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <Calendar
                {...calendarRestProps}
                mode="single"
                captionLayout="label"
                startMonth={startMonth}
                endMonth={endMonth}
                disabled={calendarDisabled}
                month={month}
                onMonthChange={(nextMonth) => {
                  const safeMonth = clampMonth(nextMonth, minDay, maxDay);
                  setMonth(safeMonth);
                  setDraftParts((current) => ({
                    ...current,
                    month: format(safeMonth, 'MM'),
                    year: format(safeMonth, 'yyyy'),
                  }));
                  calendarOnMonthChange?.(safeMonth);
                }}
                selected={calendarSelected}
                onSelect={(next) => {
                  if (!next) {
                    commit(undefined);
                    return;
                  }
                  if (!isWithinDayBounds(next, minDay, maxDay)) return;
                  commit(next);
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
});

DatePicker.displayName = 'DatePicker';
