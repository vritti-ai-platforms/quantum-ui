import Decimal from 'decimal.js';
import type { DineroCurrency } from 'dinero.js/bigint';
import { dinero, toDecimal } from 'dinero.js/bigint';
import * as currencies from 'dinero.js/bigint/currencies';
import { CUSTOM_CURRENCY_EXPONENTS, type CurrencyCode } from './currencyCode';
import { getLocale } from './locale';

// The dinero currency for a code, built from its exponent for the few currencies dinero does not carry
function resolveCurrency(currencyCode: CurrencyCode): DineroCurrency<bigint> {
  const currency = (currencies as Record<string, DineroCurrency<bigint> | undefined>)[currencyCode];
  if (currency) return currency;
  const exponent = (CUSTOM_CURRENCY_EXPONENTS as Record<string, number | undefined>)[currencyCode];
  if (exponent === undefined) throw new Error(`Unknown currency: ${currencyCode}`);
  return { code: currencyCode, base: 10n, exponent: BigInt(exponent) };
}

export function minorToMajor(minor: string, currencyCode: CurrencyCode): string {
  const currency = resolveCurrency(currencyCode);
  return toDecimal(dinero({ amount: BigInt(minor), currency }));
}

export function majorToMinor(major: string, currencyCode: CurrencyCode): string {
  const currency = resolveCurrency(currencyCode);
  const factor = new Decimal(10).pow(Number(currency.exponent));
  return new Decimal(major).mul(factor).toFixed(0);
}

export function formatCurrencyMajor(major: number, currencyCode: CurrencyCode): string {
  return new Intl.NumberFormat(getLocale() ?? 'en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(major);
}

export function formatCurrency(minor: string, currencyCode: CurrencyCode): string {
  return formatCurrencyMajor(Number(minorToMajor(minor, currencyCode)), currencyCode);
}
