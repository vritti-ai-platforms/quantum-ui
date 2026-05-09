import { tz } from '@date-fns/tz';
import type { Locale } from 'date-fns';
import { format, isValid, parseISO } from 'date-fns';
import type React from 'react';
import { useLocale } from '../../hooks/useLocale';
import { resolveTimeZone } from '../../utils/timezone';

export interface FormattedDateProps {
  value: string | null | undefined;
  dateFormat?: string;
  dateOnly?: boolean;
  timeZone?: string;
  fallback?: React.ReactNode;
  className?: string;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const formatWithTimeZone = (date: Date, dateFormat: string, timeZone: string, locale?: Locale) =>
  format(date, dateFormat, locale ? { in: tz(timeZone), locale } : { in: tz(timeZone) });

const parseDateOnly = (value: string): Date =>
  parseISO(DATE_ONLY_PATTERN.test(value) ? `${value}T00:00:00Z` : value);

const resolveDateFormat = (value: string, dateFormat?: string, dateOnly?: boolean): string | undefined => {
  if (dateFormat) return dateFormat;
  if (dateOnly || DATE_ONLY_PATTERN.test(value)) return 'P';
  if (ISO_DATETIME_PATTERN.test(value)) return 'Pp';
  return undefined;
};

export const FormattedDate: React.FC<FormattedDateProps> = ({
  value,
  dateFormat,
  dateOnly,
  timeZone,
  fallback = '—',
  className,
}) => {
  const locale = useLocale();

  if (value == null || typeof value !== 'string') {
    return <span className={className}>{fallback}</span>;
  }

  const resolvedFormat = resolveDateFormat(value, dateFormat, dateOnly);
  if (!resolvedFormat) return <span className={className}>{value}</span>;

  const isDateOnly = dateOnly || DATE_ONLY_PATTERN.test(value);
  if (isDateOnly) {
    const parsed = parseDateOnly(value);
    if (!isValid(parsed)) return <span className={className}>{fallback}</span>;
    return <span className={className}>{formatWithTimeZone(parsed, resolvedFormat, 'UTC', locale)}</span>;
  }

  const parsed = parseISO(value);
  if (!isValid(parsed)) return <span className={className}>{fallback}</span>;

  const resolvedTimeZone = timeZone ?? resolveTimeZone();
  if (!resolvedTimeZone) {
    return (
      <span className={className}>{format(parsed, resolvedFormat, locale ? { locale } : undefined)}</span>
    );
  }
  return (
    <span className={className}>{formatWithTimeZone(parsed, resolvedFormat, resolvedTimeZone, locale)}</span>
  );
};
