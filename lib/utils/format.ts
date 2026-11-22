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

// One Intl.NumberFormat per locale and options, reused: building one costs far more than formatting with it, and a
// table formats the same few shapes on every row
const numberFormatters = new Map<string, Intl.NumberFormat>();
function numberFormatter(localeTag: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${localeTag}|${JSON.stringify(options ?? {})}`;
  const cached = numberFormatters.get(key);
  if (cached) return cached;
  const formatter = new Intl.NumberFormat(localeTag, options);
  numberFormatters.set(key, formatter);
  return formatter;
}

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
  const formatter = numberFormatter(
    options.localeTag,
    options.fractionDigits != null
      ? { minimumFractionDigits: options.fractionDigits, maximumFractionDigits: options.fractionDigits }
      : undefined,
  );
  return { primary: formatter.format(num) };
};

export interface FormatPercentOptions {
  localeTag: string;
  maximumFractionDigits?: number;
}

// Formats a percentage given on a 0–100 scale (42.5 → "42.5%"), one decimal at most unless told otherwise
export const formatPercent = (
  value: number | string | null | undefined,
  options: FormatPercentOptions,
): FormattedValue => {
  if (value == null) return { primary: '—' };
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return { primary: '—' };
  const formatter = numberFormatter(options.localeTag, {
    style: 'percent',
    maximumFractionDigits: options.maximumFractionDigits ?? 1,
  });
  return { primary: formatter.format(new Decimal(num).div(100).toNumber()) };
};

export type DisplayQuantity = {
  primaryUomQty: number;
  displayUomQty: number;
  wholeDisplayUomQty: number;
  remainderPrimaryUomQty: number;
  displayUomSymbol: string;
  primaryUomSymbol: string;
  isPack: boolean;
  // The quantity broken down by unit, largest first, zero shares left out — whole display packs, the item's smaller
  // packs when it cascades its units, then the primary units left over; absent, it is the whole packs and the leftover
  breakdown?: { qty: number; symbol: string }[];
};

export interface FormatQuantityOptions {
  localeTag: string;
}

// Formats an item quantity in its display unit: a pack unit as its breakdown ("234 strip + 4 tab", or "9 box + 5 strip +
// 2 tab" for an item that cascades its units), any other unit as one figure ("12.5 kg"); the primary-unit total is the
// secondary whenever it differs
export const formatQuantity = (
  value: DisplayQuantity | null | undefined,
  options: FormatQuantityOptions,
): FormattedValue => {
  if (value == null) return { primary: '—' };
  const number = numberFormatter(options.localeTag);
  const inPrimary = `${number.format(value.primaryUomQty)} ${value.primaryUomSymbol}`;
  if (value.displayUomSymbol === value.primaryUomSymbol) return { primary: inPrimary };
  // Nothing is nothing in either unit, so it reads in the display unit the item's other quantities use
  if (value.primaryUomQty === 0) return { primary: `${number.format(0)} ${value.displayUomSymbol}` };
  if (!value.isPack) {
    return { primary: `${number.format(value.displayUomQty)} ${value.displayUomSymbol}`, secondary: inPrimary };
  }
  const parts = value.breakdown?.length
    ? value.breakdown
    : [
        { qty: value.wholeDisplayUomQty, symbol: value.displayUomSymbol },
        { qty: value.remainderPrimaryUomQty, symbol: value.primaryUomSymbol },
      ].filter((part) => part.qty !== 0);
  // Less than one of the smallest pack reads in the primary unit alone, as does a sliver every share rounds away
  if (parts.length === 0 || (parts.length === 1 && parts[0].symbol === value.primaryUomSymbol)) {
    return { primary: inPrimary };
  }
  // A negative quantity splits toward zero, so every share after the first is taken off it
  const sign = value.primaryUomQty < 0 ? '−' : '+';
  const [first, ...rest] = parts;
  const reading = [
    `${number.format(first.qty)} ${first.symbol}`,
    ...rest.map((part) => `${sign} ${number.format(Math.abs(part.qty))} ${part.symbol}`),
  ].join(' ');
  return { primary: reading, secondary: inPrimary };
};

export interface FormatCurrencyOptions {
  workspaceCurrency?: string | null;
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

  const { workspaceCurrency, exchangeRate } = options;
  if (exchangeRate != null && Number.isFinite(exchangeRate) && workspaceCurrency && workspaceCurrency !== currency) {
    const workspaceAmount = new Decimal(amountStr).times(exchangeRate).toNumber();
    if (Number.isFinite(workspaceAmount)) {
      return { primary, secondary: `(${formatCurrencyMajor(workspaceAmount, workspaceCurrency)})` };
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
  workspaceTimeZone?: string | null;
  timeZoneOverride?: string;
}

export const formatDateTime = (
  value: string | null | undefined,
  options: FormatDateTimeOptions = {},
): FormattedValue => {
  if (value == null) return { primary: '—' };
  const parsed = parseISO(value);
  if (!isValid(parsed)) return { primary: '—' };

  const primaryTz = options.timeZoneOverride ?? options.workspaceTimeZone ?? null;
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
