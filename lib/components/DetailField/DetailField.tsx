import { tz } from '@date-fns/tz';
import type { Locale } from 'date-fns';
import { format, isValid, parseISO } from 'date-fns';
import type React from 'react';
import { useLocale } from '../../hooks/useLocale';
import { getUserTimeZone, resolveTimeZone } from '../../utils/timezone';

export interface DetailFieldProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  dateFormat?: string;
  dateOnly?: boolean;
  timeZone?: string;
  number?: boolean;
}

type FormattedValue = {
  primary: React.ReactNode;
  secondary?: string;
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const formatWithTimeZone = (date: Date, dateFormat: string, timeZone: string, locale?: Locale) =>
  format(date, dateFormat, locale ? { in: tz(timeZone), locale } : { in: tz(timeZone) });

const parseDateOnly = (value: string): Date => parseISO(DATE_ONLY_PATTERN.test(value) ? `${value}T00:00:00Z` : value);

const formatValue = (
  value: React.ReactNode,
  dateFormat?: string,
  dateOnly?: boolean,
  timeZoneOverride?: string,
  locale?: Locale,
): FormattedValue => {
  if (value == null) return { primary: '—' };
  if (!dateFormat) return { primary: value };
  if (typeof value !== 'string') return { primary: value };

  if (dateOnly) {
    const parsed = parseDateOnly(value);
    if (!isValid(parsed)) return { primary: '—' };
    return { primary: formatWithTimeZone(parsed, dateFormat, 'UTC', locale) };
  }

  const parsed = parseISO(value);
  if (!isValid(parsed)) return { primary: '—' };

  const primaryTimeZone = timeZoneOverride ?? resolveTimeZone();
  if (!primaryTimeZone) {
    return { primary: format(parsed, dateFormat, locale ? { locale } : undefined) };
  }

  const primary = `${formatWithTimeZone(parsed, dateFormat, primaryTimeZone, locale)} (${primaryTimeZone})`;
  const userTimeZone = getUserTimeZone();

  if (!userTimeZone || userTimeZone === primaryTimeZone) {
    return { primary };
  }

  return {
    primary,
    secondary: `Your time: ${formatWithTimeZone(parsed, dateFormat, userTimeZone, locale)} (${userTimeZone})`,
  };
};

export const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  className,
  dateFormat,
  dateOnly,
  timeZone,
  number,
}) => {
  const locale = useLocale();
  const formattedValue = formatValue(value, dateFormat, dateOnly, timeZone, locale);

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium mt-1${number ? ' font-mono' : ''}`}>{formattedValue.primary}</p>
      {formattedValue.secondary && <p className="mt-1 text-xs text-muted-foreground">{formattedValue.secondary}</p>}
    </div>
  );
};
