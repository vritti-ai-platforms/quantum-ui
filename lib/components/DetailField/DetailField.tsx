import { format, isValid, parseISO } from 'date-fns';
import type React from 'react';

export interface DetailFieldProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  dateFormat?: string;
  number?: boolean;
}

const formatValue = (value: React.ReactNode, dateFormat?: string) => {
  if (value == null) return '—';
  if (!dateFormat) return value;
  if (typeof value !== 'string') return value;
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, dateFormat) : '—';
};

export const DetailField: React.FC<DetailFieldProps> = ({ label, value, className, dateFormat, number }) => {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium mt-1${number ? ' font-mono' : ''}`}>{formatValue(value, dateFormat)}</p>
    </div>
  );
};
