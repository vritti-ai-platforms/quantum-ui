import { CalendarIcon, Clock } from 'lucide-react';
import { forwardRef, useEffect, useId, useState } from 'react';
import { Calendar } from '../../../shadcn/shadcnCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import { cn } from '../../../shadcn/utils';
import { Button } from '../Button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { TimePickerPanel } from '../TimePicker/TimePickerPanel';
import { MonthPicker } from './components/MonthPicker';
import { YearPicker } from './components/YearPicker';
import type { DatePickerProps, DatePickerRangeProps, DatePickerSingleProps, DateRange } from './types';
import {
  derivePickerType,
  deriveUse12Hour,
  formatRangeDisplay,
  formatSingleDisplay,
  getDefaultFormat,
  getDefaultPlaceholder,
} from './utils';

// Merge date from calendar selection with time from existing value
function mergeDateTime(dateSource: Date, timeSource?: Date): Date {
  const result = new Date(dateSource);
  if (timeSource) {
    result.setHours(timeSource.getHours(), timeSource.getMinutes(), timeSource.getSeconds());
  }
  return result;
}

// Format-driven date/time picker with single and range modes
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>((props, ref) => {
  const {
    label,
    description,
    error,
    placeholder,
    format: formatProp,
    onBlur,
    open: controlledOpen,
    onOpenChange,
    calendarProps,
    className,
    id,
    name: _name,
    disabled,
    hourStep = 1,
    minuteStep = 5,
    clearable,
    minDate,
    maxDate,
  } = props;

  const isRange = props.range === true;
  const presets = isRange ? (props as DatePickerRangeProps).presets : undefined;

  // Derive picker type and display format from format string
  const pickerType = formatProp ? derivePickerType(formatProp) : 'date';
  const resolvedFormat = formatProp ?? getDefaultFormat(pickerType);
  const use12Hour = deriveUse12Hour(resolvedFormat);
  const resolvedPlaceholder = placeholder ?? getDefaultPlaceholder(pickerType, isRange);

  const generatedId = useId();
  const resolvedId = id ?? generatedId;

  // Controlled/uncontrolled popover state
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOpen !== undefined ? (onOpenChange ?? (() => {})) : setInternalOpen;

  // Fire onBlur when popover closes — marks field as touched for react-hook-form
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) onBlur?.();
  };

  // --- Single mode state ---
  const singleValue = !isRange ? (props as DatePickerSingleProps).value : undefined;
  const singleOnChange = !isRange ? (props as DatePickerSingleProps).onChange : undefined;
  const [internalDate, setInternalDate] = useState<Date | undefined>(singleValue);

  // --- Range mode state ---
  const rangeValue = isRange ? (props as DatePickerRangeProps).value : undefined;
  const rangeOnChange = isRange ? (props as DatePickerRangeProps).onChange : undefined;
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(rangeValue);

  // Sync internal state with controlled value
  useEffect(() => {
    if (!isRange && singleValue !== undefined) setInternalDate(singleValue);
    if (isRange && rangeValue !== undefined) setInternalRange(rangeValue);
  }, [singleValue, rangeValue, isRange]);

  // Display values
  const displayDate = singleValue ?? internalDate;
  const displayRange = rangeValue ?? internalRange;
  const hasValue = isRange ? !!displayRange?.from : !!displayDate;

  const displayText = hasValue
    ? isRange
      ? formatRangeDisplay(displayRange as DateRange, resolvedFormat)
      : formatSingleDisplay(displayDate as Date, resolvedFormat)
    : resolvedPlaceholder;

  // Calendar disabled matchers for minDate/maxDate
  const calendarDisabled = [...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])];

  // --- Single mode handlers ---

  // Select date/year/month and close
  const handleSingleSelect = (date: Date | undefined) => {
    setInternalDate(date);
    singleOnChange?.(date);
    handleOpenChange(false);
  };

  // Datetime: merge calendar date with existing time, stay open
  const handleSingleDateMerge = (selected: Date | undefined) => {
    if (!selected) return;
    const next = mergeDateTime(selected, displayDate);
    setInternalDate(next);
    singleOnChange?.(next);
  };

  // Time change for time/datetime modes
  const handleSingleTimeChange = (date: Date) => {
    setInternalDate(date);
    singleOnChange?.(date);
  };

  // --- Range mode handlers ---

  // Calendar range selection — uses internalRange for time merge
  const handleRangeDateSelect = (range: DateRange | undefined) => {
    if (!range) {
      setInternalRange(undefined);
      rangeOnChange?.(undefined);
      return;
    }

    if (pickerType === 'datetime') {
      const from = range.from ? mergeDateTime(range.from, internalRange?.from) : undefined;
      const to = range.to ? mergeDateTime(range.to, internalRange?.to) : undefined;
      const merged = { from, to };
      setInternalRange(merged);
      rangeOnChange?.(merged);
    } else {
      setInternalRange(range);
      rangeOnChange?.(range);
    }
  };

  // Individual from/to date selection for datetime range (two separate calendars)
  const handleRangeSideSelect = (date: Date | undefined, side: 'from' | 'to') => {
    if (!date) return;
    const merged = mergeDateTime(date, side === 'from' ? internalRange?.from : internalRange?.to);
    const next = side === 'from' ? { from: merged, to: internalRange?.to } : { from: internalRange?.from, to: merged };
    setInternalRange(next);
    rangeOnChange?.(next);
  };

  // Range time change for from/to side — uses internalRange for the other side
  const handleRangeTimeChange = (date: Date, side: 'from' | 'to') => {
    const next = side === 'from' ? { from: date, to: internalRange?.to } : { from: internalRange?.from, to: date };
    setInternalRange(next);
    rangeOnChange?.(next);
  };

  // Preset selection applies range and closes
  const handlePresetSelect = (range: DateRange) => {
    setInternalRange(range);
    rangeOnChange?.(range);
    handleOpenChange(false);
  };

  // Clear value and close
  const handleClear = () => {
    if (isRange) {
      setInternalRange(undefined);
      rangeOnChange?.(undefined);
    } else {
      setInternalDate(undefined);
      singleOnChange?.(undefined);
    }
    handleOpenChange(false);
  };

  // Shared calendar props to avoid repetition across 3 Calendar instances
  const sharedCalendarProps = {
    ...calendarProps,
    captionLayout: 'dropdown' as const,
    ...(calendarDisabled.length > 0 && { disabled: calendarDisabled }),
    ...(minDate && { startMonth: minDate }),
    ...(maxDate && { endMonth: maxDate }),
  };

  // Build range selected value for calendar
  const rangeSelected = displayRange?.from ? { from: displayRange.from, to: displayRange.to } : undefined;

  return (
    <Field data-disabled={disabled}>
      {label && <FieldLabel htmlFor={resolvedId}>{label}</FieldLabel>}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            id={resolvedId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-label={!label ? resolvedPlaceholder : undefined}
            className={cn('w-full justify-between font-normal', !hasValue && 'text-muted-foreground', className)}
          >
            {displayText}
            {pickerType === 'time' ? (
              <Clock className="size-4 text-muted-foreground" />
            ) : (
              <CalendarIcon className="size-4 text-muted-foreground" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          {isRange ? (
            <div className={cn(presets && 'flex')}>
              {/* Preset sidebar */}
              {presets && presets.length > 0 && (
                <fieldset aria-label="Presets" className="flex flex-col gap-1 border-r border-border p-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="justify-start text-sm"
                      onClick={() => handlePresetSelect(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </fieldset>
              )}
              <div>
                {/* Date-only range: dual-month calendar */}
                {pickerType === 'date' && (
                  <Calendar
                    {...sharedCalendarProps}
                    mode="range"
                    numberOfMonths={2}
                    selected={rangeSelected}
                    onSelect={(range) => handleRangeDateSelect(range ? { from: range.from, to: range.to } : undefined)}
                  />
                )}
                {/* Datetime range: each calendar paired with its time picker */}
                {pickerType === 'datetime' && (
                  <div className="flex">
                    <fieldset aria-label="From date and time" className="flex">
                      <Calendar
                        {...sharedCalendarProps}
                        mode="single"
                        selected={displayRange?.from}
                        onSelect={(d) => handleRangeSideSelect(d, 'from')}
                      />
                      <div className="border-l border-border">
                        <div className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">From</div>
                        <TimePickerPanel
                          value={displayRange?.from}
                          onValueChange={(d) => handleRangeTimeChange(d, 'from')}
                          use12Hour={use12Hour}
                          hourStep={hourStep}
                          minuteStep={minuteStep}
                        />
                      </div>
                    </fieldset>
                    <fieldset aria-label="To date and time" className="flex border-l border-border">
                      <Calendar
                        {...sharedCalendarProps}
                        mode="single"
                        selected={displayRange?.to}
                        defaultMonth={new Date(new Date().getFullYear(), new Date().getMonth() + 1)}
                        onSelect={(d) => handleRangeSideSelect(d, 'to')}
                      />
                      <div className="border-l border-border">
                        <div className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">To</div>
                        <TimePickerPanel
                          value={displayRange?.to}
                          onValueChange={(d) => handleRangeTimeChange(d, 'to')}
                          use12Hour={use12Hour}
                          hourStep={hourStep}
                          minuteStep={minuteStep}
                        />
                      </div>
                    </fieldset>
                  </div>
                )}
                {/* Time-only range */}
                {pickerType === 'time' && (
                  <div className="flex">
                    <fieldset aria-label="From time" className="flex-1 border-r border-border">
                      <div className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">From</div>
                      <TimePickerPanel
                        value={displayRange?.from}
                        onValueChange={(d) => handleRangeTimeChange(d, 'from')}
                        use12Hour={use12Hour}
                        hourStep={hourStep}
                        minuteStep={minuteStep}
                      />
                    </fieldset>
                    <fieldset aria-label="To time" className="flex-1">
                      <div className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">To</div>
                      <TimePickerPanel
                        value={displayRange?.to}
                        onValueChange={(d) => handleRangeTimeChange(d, 'to')}
                        use12Hour={use12Hour}
                        hourStep={hourStep}
                        minuteStep={minuteStep}
                      />
                    </fieldset>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {pickerType === 'year' && (
                <YearPicker value={displayDate} onSelect={handleSingleSelect} minDate={minDate} maxDate={maxDate} />
              )}
              {pickerType === 'month' && (
                <MonthPicker value={displayDate} onSelect={handleSingleSelect} minDate={minDate} maxDate={maxDate} />
              )}
              {pickerType === 'date' && (
                <Calendar {...sharedCalendarProps} mode="single" selected={displayDate} onSelect={handleSingleSelect} />
              )}
              {pickerType === 'time' && (
                <TimePickerPanel
                  value={displayDate}
                  onValueChange={handleSingleTimeChange}
                  use12Hour={use12Hour}
                  hourStep={hourStep}
                  minuteStep={minuteStep}
                />
              )}
              {pickerType === 'datetime' && (
                <div className="sm:flex">
                  <Calendar
                    {...sharedCalendarProps}
                    mode="single"
                    selected={displayDate}
                    onSelect={handleSingleDateMerge}
                  />
                  <div className="border-t sm:border-l sm:border-t-0 border-border">
                    <TimePickerPanel
                      value={displayDate}
                      onValueChange={handleSingleTimeChange}
                      use12Hour={use12Hour}
                      hourStep={hourStep}
                      minuteStep={minuteStep}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Clear footer */}
          {clearable && hasValue && (
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {description && !error && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
});

DatePicker.displayName = 'DatePicker';
