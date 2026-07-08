// Cell components that wrap useFormatters so DataTable rows share DetailField's locale/timezone/currency formatting

import type React from 'react';
import { useFormatters } from '../../../hooks/useFormatters';
import type { CurrencyAmount } from '../../../utils/format';

export interface StringCellProps {
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}

export const StringCell: React.FC<StringCellProps> = ({ value, mono, className }) => {
  const fmt = useFormatters();
  const { primary } = fmt.string(value);
  return <span className={[mono ? 'font-mono' : '', className].filter(Boolean).join(' ') || undefined}>{primary}</span>;
};

export interface NumberCellProps {
  value: number | string | null | undefined;
  fractionDigits?: number;
  className?: string;
}

export const NumberCell: React.FC<NumberCellProps> = ({ value, fractionDigits, className }) => {
  const fmt = useFormatters();
  const { primary } = fmt.number(value, { fractionDigits });
  return <span className={['font-mono', className].filter(Boolean).join(' ')}>{primary}</span>;
};

export interface CurrencyCellProps {
  value: CurrencyAmount | null | undefined;
  exchangeRate?: number | null;
  className?: string;
}

export const CurrencyCell: React.FC<CurrencyCellProps> = ({ value, exchangeRate, className }) => {
  const fmt = useFormatters();
  const { primary, secondary } = fmt.currency(value, { exchangeRate });
  return (
    <span className={['font-mono', className].filter(Boolean).join(' ')}>
      {primary}
      {secondary && <span className="ml-1 text-xs text-muted-foreground">{secondary}</span>}
    </span>
  );
};

export interface DateCellProps {
  value: string | null | undefined;
  className?: string;
}

export const DateCell: React.FC<DateCellProps> = ({ value, className }) => {
  const fmt = useFormatters();
  const { primary } = fmt.date(value);
  return <span className={className}>{primary}</span>;
};

export interface DateTimeCellProps {
  value: string | null | undefined;
  timeZone?: string;
  className?: string;
}

export const DateTimeCell: React.FC<DateTimeCellProps> = ({ value, timeZone, className }) => {
  const fmt = useFormatters();
  const { primary } = fmt.dateTime(value, { timeZone });
  return <span className={className}>{primary}</span>;
};
