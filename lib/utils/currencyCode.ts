import * as currencies from 'dinero.js/bigint/currencies';

// The currencies dinero does not carry, with their exponents; @vritti/api-sdk/money adds the same ones
export const CUSTOM_CURRENCY_EXPONENTS = {
  ANG: 2,
  HRK: 2,
  XAG: 0,
  XAU: 0,
  XDR: 0,
  XPD: 0,
  XPT: 0,
  ZWL: 2,
} as const;

// An ISO 4217 currency the platform supports: dinero's currencies and the few it lacks, the same list
// @vritti/api-sdk/money accepts
export type CurrencyCode = keyof typeof currencies | keyof typeof CUSTOM_CURRENCY_EXPONENTS;

// Every supported code, each list's own keys only so nothing inherited passes for a currency
const CURRENCY_CODES: ReadonlySet<string> = new Set([
  ...Object.keys(currencies),
  ...Object.keys(CUSTOM_CURRENCY_EXPONENTS),
]);

// Whether a value is a currency the platform supports
export function isCurrencyCode(code: unknown): code is CurrencyCode {
  return typeof code === 'string' && CURRENCY_CODES.has(code);
}
