// Cell components that wrap useFormatters so DataTable rows pick up the same locale/timezone/
// currency formatting as DetailField. Use these inside a column's `cell` callback:
//
//   { accessorKey: 'totalPrice', cell: ({ row }) => <CurrencyCell value={row.original.totalPrice} /> }
//
// For composed cells (cross-UOM hints, badges + values, etc.), call the `useFormatters` hook at
// the top of your component and use the formatter functions directly.

import type React from 'react';
import { useFormatters } from '../../../hooks/useFormatters';
import type { CurrencyAmount } from '../../../utils/format';

export interface StringCellProps {
  value: React.ReactNode;
  // Render in a monospace font (for identifier-style strings: PO numbers, codes, IDs).
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
  // PO→BU multiplier. When set and BU currency differs, renders the BU-currency equivalent in
  // muted small text alongside the primary.
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
