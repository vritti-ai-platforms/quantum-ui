import { tz } from '@date-fns/tz';
import type { Locale } from 'date-fns';
import { format, isValid, parseISO } from 'date-fns';
import type React from 'react';
import { useBUTimezone } from '../../hooks/useBUTimezone';
import { useLocale } from '../../hooks/useLocale';
import { getUserTimeZone } from '../../utils/timezone';
import { Skeleton } from '../Skeleton';

export interface DetailFieldProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  dateFormat?: string;
  dateOnly?: boolean;
  timeZone?: string;
  number?: boolean;
  loading?: boolean;
}

type FormattedValue = {
  primary: React.ReactNode;
  secondary?: string;
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const formatWithTimeZone = (date: Date, dateFormat: string, timeZone: string, locale?: Locale) =>
  format(date, dateFormat, locale ? { in: tz(timeZone), locale } : { in: tz(timeZone) });

const parseDateOnly = (value: string): Date => parseISO(DATE_ONLY_PATTERN.test(value) ? `${value}T00:00:00Z` : value);

// If the value is a date-like string but no explicit dateFormat is given,
// fall back to date-fns locale presets so the rendered format respects the user's locale.
const resolveDateFormat = (value: React.ReactNode, dateFormat?: string, dateOnly?: boolean): string | undefined => {
  if (dateFormat) return dateFormat;
  if (typeof value !== 'string') return undefined;
  if (dateOnly || DATE_ONLY_PATTERN.test(value)) return 'P';
  if (ISO_DATETIME_PATTERN.test(value)) return 'Pp';
  return undefined;
};

const formatValue = (
  value: React.ReactNode,
  dateFormat?: string,
  dateOnly?: boolean,
  timeZoneOverride?: string,
  locale?: Locale,
  buTimeZone?: string | null,
): FormattedValue => {
  if (value == null) return { primary: '—' };

  const resolvedFormat = resolveDateFormat(value, dateFormat, dateOnly);
  if (!resolvedFormat) return { primary: value };
  if (typeof value !== 'string') return { primary: value };

  const isDateOnly = dateOnly || DATE_ONLY_PATTERN.test(value);
  if (isDateOnly) {
    const parsed = parseDateOnly(value);
    if (!isValid(parsed)) return { primary: '—' };
    return { primary: formatWithTimeZone(parsed, resolvedFormat, 'UTC', locale) };
  }

  const parsed = parseISO(value);
  if (!isValid(parsed)) return { primary: '—' };

  const primaryTimeZone = timeZoneOverride ?? buTimeZone ?? null;
  if (!primaryTimeZone) {
    return { primary: format(parsed, resolvedFormat, locale ? { locale } : undefined) };
  }

  const primary = `${formatWithTimeZone(parsed, resolvedFormat, primaryTimeZone, locale)} (${primaryTimeZone})`;
  const userTimeZone = getUserTimeZone();

  if (!userTimeZone || userTimeZone === primaryTimeZone) {
    return { primary };
  }

  return {
    primary,
    secondary: `Your time: ${formatWithTimeZone(parsed, resolvedFormat, userTimeZone, locale)} (${userTimeZone})`,
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
  loading,
}) => {
  const locale = useLocale();
  const buTimeZone = useBUTimezone();

  if (loading) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">{label}</p>
        <Skeleton className="mt-1 h-5 w-32" />
      </div>
    );
  }

  const formattedValue = formatValue(value, dateFormat, dateOnly, timeZone, locale, buTimeZone);

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium mt-1${number ? ' font-mono' : ''}`}>{formattedValue.primary}</p>
      {formattedValue.secondary && <p className="mt-1 text-xs text-muted-foreground">{formattedValue.secondary}</p>}
    </div>
  );
};
