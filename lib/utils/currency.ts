import * as currencies from 'dinero.js/bigint/currencies';
import { getConfig } from '../config';

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

const USER_CURRENCY_STORAGE_KEY = 'vritti_user_currency';
const BUSINESS_UNIT_CURRENCY_SUFFIX = '_currency';
const BUSINESS_UNIT_CURRENCY_PREFIX = 'vritti_';

const canUseStorage = () => typeof window !== 'undefined';

const normalizeCurrencyCode = (code: string | null | undefined): string | null => {
  const trimmed = code?.trim().toUpperCase();
  if (!trimmed) return null;
  return /^[A-Z]{3}$/.test(trimmed) ? trimmed : null;
};

const getBusinessUnitCurrencyStorageKey = (businessUnitId: string) =>
  `${BUSINESS_UNIT_CURRENCY_PREFIX}${businessUnitId}${BUSINESS_UNIT_CURRENCY_SUFFIX}`;

export function setUserCurrency(code: string): void {
  if (!canUseStorage()) return;
  const normalized = normalizeCurrencyCode(code);
  if (!normalized) return;
  localStorage.setItem(USER_CURRENCY_STORAGE_KEY, normalized);
}

export function getUserCurrency(): string | null {
  if (!canUseStorage()) return null;
  return normalizeCurrencyCode(localStorage.getItem(USER_CURRENCY_STORAGE_KEY));
}

export function setBusinessUnitCurrency(businessUnitId: string, code: string): void {
  if (!canUseStorage()) return;
  const normalizedBusinessUnitId = businessUnitId.trim();
  const normalized = normalizeCurrencyCode(code);
  if (!normalizedBusinessUnitId || !normalized) return;
  localStorage.setItem(getBusinessUnitCurrencyStorageKey(normalizedBusinessUnitId), normalized);
}

export function getBusinessUnitCurrency(businessUnitId: string): string | null {
  if (!canUseStorage()) return null;
  const normalizedBusinessUnitId = businessUnitId.trim();
  if (!normalizedBusinessUnitId) return null;
  return normalizeCurrencyCode(localStorage.getItem(getBusinessUnitCurrencyStorageKey(normalizedBusinessUnitId)));
}

export function resolveCurrency(): string | null {
  const configured = normalizeCurrencyCode(getConfig().currency.resolveCurrency?.());
  if (configured) return configured;

  return getUserCurrency();
}
