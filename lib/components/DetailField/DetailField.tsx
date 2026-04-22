import { tz } from '@date-fns/tz';
import type { Locale } from 'date-fns';
import { format, isValid, parseISO } from 'date-fns';
import type React from 'react';
import { useLocale } from '../../hooks/useLocale';
import { getTimeZone } from '../../utils/timezone';

export interface DetailFieldProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  dateFormat?: string;
  number?: boolean;
}

const formatValue = (value: React.ReactNode, dateFormat?: string, locale?: Locale) => {
  if (value == null) return '—';
  if (!dateFormat) return value;
  if (typeof value !== 'string') return value;
  const parsed = parseISO(value);
  if (!isValid(parsed)) return '—';

  const timeZone = getTimeZone() ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!timeZone) return format(parsed, dateFormat, locale ? { locale } : undefined);

  return format(parsed, dateFormat, locale ? { in: tz(timeZone), locale } : { in: tz(timeZone) });
};

export const DetailField: React.FC<DetailFieldProps> = ({ label, value, className, dateFormat, number }) => {
  const locale = useLocale();

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium mt-1${number ? ' font-mono' : ''}`}>{formatValue(value, dateFormat, locale)}</p>
    </div>
  );
};
