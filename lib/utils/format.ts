// Pure value-formatting helpers (no hooks) returning { primary, secondary? } for DetailField, DataTable cells, etc.
import { tz } from '@date-fns/tz';
import type { Locale } from 'date-fns';
import { format, isValid, parseISO } from 'date-fns';
import type React from 'react';
import Decimal from './decimal';
import { formatCurrencyMajor } from './money';
import { getUserTimeZone } from './timezone';

export type CurrencyAmount = { currency: string; value: string };

export type FormattedValue = { primary: React.ReactNode; secondary?: string };

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const formatWithTimeZone = (date: Date, dateFormat: string, timeZone: string, locale?: Locale) =>
  format(date, dateFormat, locale ? { in: tz(timeZone), locale } : { in: tz(timeZone) });

const parseDateOnly = (value: string): Date => parseISO(DATE_ONLY_PATTERN.test(value) ? `${value}T00:00:00Z` : value);

export const formatString = (value: React.ReactNode): FormattedValue => {
  if (value == null) return { primary: '—' };
  // Treat empty/whitespace strings as "no value", but let JSX/element values pass through untouched.
  if (typeof value === 'string' && value.trim() === '') return { primary: '—' };
  return { primary: value };
};

export interface FormatNumberOptions {
  localeTag: string;
  fractionDigits?: number;
}

export const formatNumber = (
  value: number | string | null | undefined,
  options: FormatNumberOptions,
): FormattedValue => {
  if (value == null) return { primary: '—' };
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return { primary: '—' };
  const formatter = new Intl.NumberFormat(
    options.localeTag,
    options.fractionDigits != null
      ? { minimumFractionDigits: options.fractionDigits, maximumFractionDigits: options.fractionDigits }
      : undefined,
  );
  return { primary: formatter.format(num) };
};

export interface FormatCurrencyOptions {
  buCurrency?: string | null;
  exchangeRate?: number | null;
}

export const formatCurrency = (
  value: CurrencyAmount | null | undefined,
  options: FormatCurrencyOptions = {},
): FormattedValue => {
  if (value == null) return { primary: '—' };
  const { currency, value: amountStr } = value;
  const amount = Number(amountStr);
  if (!Number.isFinite(amount)) return { primary: '—' };
  const primary = formatCurrencyMajor(amount, currency);

  const { buCurrency, exchangeRate } = options;
  if (exchangeRate != null && Number.isFinite(exchangeRate) && buCurrency && buCurrency !== currency) {
    const buAmount = new Decimal(amountStr).times(exchangeRate).toNumber();
    if (Number.isFinite(buAmount)) {
      return { primary, secondary: `≈ ${formatCurrencyMajor(buAmount, buCurrency)}` };
    }
  }
  return { primary };
};

export interface FormatDateOptions {
  locale?: Locale;
}

export const formatDate = (value: string | null | undefined, options: FormatDateOptions = {}): FormattedValue => {
  if (value == null) return { primary: '—' };
  const parsed = DATE_ONLY_PATTERN.test(value) ? parseDateOnly(value) : parseISO(value);
  if (!isValid(parsed)) return { primary: '—' };
  // Render date-only values in UTC so the displayed day matches the stored YYYY-MM-DD.
  return { primary: formatWithTimeZone(parsed, 'P', 'UTC', options.locale) };
};

export interface FormatDateTimeOptions {
  locale?: Locale;
  buTimeZone?: string | null;
  timeZoneOverride?: string;
}

export const formatDateTime = (
  value: string | null | undefined,
  options: FormatDateTimeOptions = {},
): FormattedValue => {
  if (value == null) return { primary: '—' };
  const parsed = parseISO(value);
  if (!isValid(parsed)) return { primary: '—' };

  const primaryTz = options.timeZoneOverride ?? options.buTimeZone ?? null;
  if (!primaryTz) {
    return { primary: format(parsed, 'Pp', options.locale ? { locale: options.locale } : undefined) };
  }
  const primary = `${formatWithTimeZone(parsed, 'Pp', primaryTz, options.locale)} (${primaryTz})`;
  const userTz = getUserTimeZone();
  if (!userTz || userTz === primaryTz) return { primary };
  return {
    primary,
    secondary: `Your time: ${formatWithTimeZone(parsed, 'Pp', userTz, options.locale)} (${userTz})`,
  };
};
