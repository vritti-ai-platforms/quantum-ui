import { useMemo } from 'react';
import { resolveCurrency } from '../utils/currency';
import {
  type CurrencyAmount,
  type DisplayQuantity,
  type FormattedValue,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatQuantity,
  formatString,
} from '../utils/format';
import { getLocale } from '../utils/locale';
import { useLocale } from './useLocale';
import { useWorkspaceTimeZone } from './useWorkspaceTimeZone';

export interface Formatters {
  string: (value: React.ReactNode) => FormattedValue;
  number: (value: number | string | null | undefined, options?: { fractionDigits?: number }) => FormattedValue;
  percent: (value: number | string | null | undefined, options?: { maximumFractionDigits?: number }) => FormattedValue;
  currency: (value: CurrencyAmount | null | undefined, options?: { exchangeRate?: number | null }) => FormattedValue;
  quantity: (value: DisplayQuantity | null | undefined) => FormattedValue;
  date: (value: string | null | undefined) => FormattedValue;
  dateTime: (value: string | null | undefined, options?: { timeZone?: string }) => FormattedValue;
}

export interface UseFormattersOptions {
  // Formats for one site inside an LE or site-group workspace — its timezone and currency instead of the workspace's
  siteId?: string | null;
}

export function useFormatters(options?: UseFormattersOptions): Formatters {
  const locale = useLocale();
  const workspaceTimeZone = useWorkspaceTimeZone(options?.siteId);
  const workspaceCurrency = resolveCurrency(options?.siteId);
  const localeTag = getLocale() ?? 'en-US';

  return useMemo<Formatters>(
    () => ({
      string: formatString,
      number: (value, options) => formatNumber(value, { localeTag, fractionDigits: options?.fractionDigits }),
      percent: (value, options) =>
        formatPercent(value, { localeTag, maximumFractionDigits: options?.maximumFractionDigits }),
      currency: (value, options) =>
        formatCurrency(value, { workspaceCurrency, exchangeRate: options?.exchangeRate ?? null }),
      quantity: (value) => formatQuantity(value, { localeTag }),
      date: (value) => formatDate(value, { locale }),
      dateTime: (value, options) =>
        formatDateTime(value, { locale, workspaceTimeZone, timeZoneOverride: options?.timeZone }),
    }),
    [locale, workspaceTimeZone, workspaceCurrency, localeTag],
  );
}
