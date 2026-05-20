import Decimal from 'decimal.js';
import type { DineroCurrency } from 'dinero.js/bigint';
import { dinero, toDecimal } from 'dinero.js/bigint';
import * as currencies from 'dinero.js/bigint/currencies';
import { getLocale } from './locale';

function resolveCurrency(currencyCode: string): DineroCurrency<bigint> {
  const currency = (currencies as Record<string, DineroCurrency<bigint> | undefined>)[currencyCode];
  if (!currency) throw new Error(`Unknown currency: ${currencyCode}`);
  return currency;
}

export function minorToMajor(minor: string, currencyCode: string): string {
  const currency = resolveCurrency(currencyCode);
  return toDecimal(dinero({ amount: BigInt(minor), currency }));
}

export function majorToMinor(major: string, currencyCode: string): string {
  const currency = resolveCurrency(currencyCode);
  const factor = new Decimal(10).pow(Number(currency.exponent));
  return new Decimal(major).mul(factor).toFixed(0);
}

export function formatCurrencyMajor(major: number, currencyCode: string): string {
  return new Intl.NumberFormat(getLocale() ?? 'en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(major);
}

export function formatCurrency(minor: string, currencyCode: string): string {
  return formatCurrencyMajor(Number(minorToMajor(minor, currencyCode)), currencyCode);
}
