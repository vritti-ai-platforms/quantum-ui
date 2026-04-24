import * as currencies from 'dinero.js/bigint/currencies';

export type CurrencyValue = { currency: string; value: string };

const CUSTOM_CURRENCY_EXPONENTS: Record<string, number> = {
  ANG: 2,
  HRK: 2,
  XAG: 0,
  XAU: 0,
  XDR: 0,
  XPD: 0,
  XPT: 0,
  ZWL: 2,
};

export function getCurrencyExponent(code: string): number {
  const custom = CUSTOM_CURRENCY_EXPONENTS[code];
  if (custom !== undefined) return custom;
  const currency = (currencies as Record<string, { exponent: bigint | number } | undefined>)[code];
  if (!currency) return 2;
  return Number(currency.exponent);
}
