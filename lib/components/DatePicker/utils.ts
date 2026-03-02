import { format } from 'date-fns';
import type { DateRange, PickerType } from './types';

// Derive picker type from date-fns format string tokens
export function derivePickerType(fmt: string): PickerType {
  const hasDay = /d/.test(fmt);
  const hasTime = /[Hh]/.test(fmt);
  const hasMonth = /M/.test(fmt);
  const hasYear = /y/i.test(fmt);

  if (hasDay && hasTime) return 'datetime';
  if (hasDay) return 'date';
  if (hasTime) return 'time';
  if (hasMonth) return 'month';
  if (hasYear) return 'year';

  return 'date';
}

// Derive 12h vs 24h from format string (lowercase h = 12h, uppercase H = 24h)
export function deriveUse12Hour(fmt: string): boolean {
  return !/H/.test(fmt);
}

// Format a single date for trigger display
export function formatSingleDisplay(date: Date, fmt: string): string {
  return format(date, fmt);
}

// Format a date range for trigger display
export function formatRangeDisplay(range: DateRange, fmt: string): string {
  const fromStr = range.from ? format(range.from, fmt) : '';
  const toStr = range.to ? format(range.to, fmt) : '';

  if (fromStr && toStr) return `${fromStr} \u2013 ${toStr}`;
  if (fromStr) return `${fromStr} \u2013 \u2026`;
  return '';
}

// Default placeholder per picker type and mode
export function getDefaultPlaceholder(pickerType: PickerType, isRange: boolean): string {
  const base: Record<PickerType, string> = {
    year: 'Select year',
    month: 'Select month',
    date: 'Select date',
    time: 'Select time',
    datetime: 'Select date & time',
  };

  return isRange ? `${base[pickerType]} range` : base[pickerType];
}

// Default format string per picker type
export function getDefaultFormat(pickerType: PickerType): string {
  const formats: Record<PickerType, string> = {
    year: 'yyyy',
    month: 'MMM yyyy',
    date: 'MMM d, yyyy',
    time: 'hh:mm aa',
    datetime: 'MMM d, yyyy hh:mm aa',
  };

  return formats[pickerType];
}
