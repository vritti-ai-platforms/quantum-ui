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
import { useLocale } from './useLocale';
import { useWorkspaceCurrency } from './useWorkspaceCurrency';
import { useWorkspaceTimeZone } from './useWorkspaceTimeZone';

export interface Formatters {
  string: (value: React.ReactNode) => FormattedValue;
  number: (value: number | string | null | undefined, options?: { fractionDigits?: number }) => FormattedValue;
  currency: (value: CurrencyAmount | null | undefined, options?: { exchangeRate?: number | null }) => FormattedValue;
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
  const workspaceCurrency = useWorkspaceCurrency(options?.siteId);
  const localeTag = getLocale() ?? 'en-US';

  return useMemo<Formatters>(
    () => ({
      string: formatString,
      number: (value, options) => formatNumber(value, { localeTag, fractionDigits: options?.fractionDigits }),
      currency: (value, options) =>
        formatCurrency(value, { workspaceCurrency, exchangeRate: options?.exchangeRate ?? null }),
      date: (value) => formatDate(value, { locale }),
      dateTime: (value, options) =>
        formatDateTime(value, { locale, workspaceTimeZone, timeZoneOverride: options?.timeZone }),
    }),
    [locale, workspaceTimeZone, workspaceCurrency, localeTag],
  );
}
