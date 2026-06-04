import { useMemo } from 'react';
import {
  type CurrencyAmount,
  type FormattedValue,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatString,
} from '../utils/format';
import { getLocale } from '../utils/locale';
import { useBUCurrency } from './useBUCurrency';
import { useBUTimezone } from './useBUTimezone';
import { useLocale } from './useLocale';

// Formatters with locale / BU currency / BU timezone pre-bound to current context. Use this
// inside any cell callback or component where you need consistent number/currency/date output
// without threading the context yourself.
//
// Example:
//   const fmt = useFormatters();
//   const { primary, secondary } = fmt.currency(po.totalAmount, { exchangeRate: po.exchangeRate });
//
// The returned object is stable across renders unless locale / BU currency / BU timezone change,
// so it's safe to put in `useMemo` dependency arrays for column definitions.
export interface Formatters {
  string: (value: React.ReactNode) => FormattedValue;
  number: (
    value: number | string | null | undefined,
    options?: { fractionDigits?: number },
  ) => FormattedValue;
  currency: (
    value: CurrencyAmount | null | undefined,
    options?: { exchangeRate?: number | null },
  ) => FormattedValue;
  date: (value: string | null | undefined) => FormattedValue;
  dateTime: (
    value: string | null | undefined,
    options?: { timeZone?: string },
  ) => FormattedValue;
}

export function useFormatters(): Formatters {
  const locale = useLocale();
  const buTimeZone = useBUTimezone();
  const buCurrency = useBUCurrency();
  const localeTag = getLocale() ?? 'en-US';

  return useMemo<Formatters>(
    () => ({
      string: formatString,
      number: (value, options) =>
        formatNumber(value, { localeTag, fractionDigits: options?.fractionDigits }),
      currency: (value, options) =>
        formatCurrency(value, { buCurrency, exchangeRate: options?.exchangeRate ?? null }),
      date: (value) => formatDate(value, { locale }),
      dateTime: (value, options) =>
        formatDateTime(value, { locale, buTimeZone, timeZoneOverride: options?.timeZone }),
    }),
    [locale, buTimeZone, buCurrency, localeTag],
  );
}
