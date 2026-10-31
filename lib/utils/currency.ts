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
const WORKSPACE_CURRENCY_SUFFIX = '_currency';
const WORKSPACE_CURRENCY_PREFIX = 'vritti_';

const canUseStorage = () => typeof window !== 'undefined';

const normalizeCurrencyCode = (code: string | null | undefined): string | null => {
  const trimmed = code?.trim().toUpperCase();
  if (!trimmed) return null;
  return /^[A-Z]{3}$/.test(trimmed) ? trimmed : null;
};

const getWorkspaceCurrencyStorageKey = (workspaceId: string) =>
  `${WORKSPACE_CURRENCY_PREFIX}${workspaceId}${WORKSPACE_CURRENCY_SUFFIX}`;

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

// Records the currency a workspace (org, site group, legal entity or site) prices in, keyed by its id
export function setWorkspaceCurrency(workspaceId: string, code: string): void {
  if (!canUseStorage()) return;
  const normalizedWorkspaceId = workspaceId.trim();
  const normalized = normalizeCurrencyCode(code);
  if (!normalizedWorkspaceId || !normalized) return;
  localStorage.setItem(getWorkspaceCurrencyStorageKey(normalizedWorkspaceId), normalized);
}

export function getWorkspaceCurrency(workspaceId: string): string | null {
  if (!canUseStorage()) return null;
  const normalizedWorkspaceId = workspaceId.trim();
  if (!normalizedWorkspaceId) return null;
  return normalizeCurrencyCode(localStorage.getItem(getWorkspaceCurrencyStorageKey(normalizedWorkspaceId)));
}

export function resolveCurrency(): string | null {
  const configured = normalizeCurrencyCode(getConfig().currency.resolveCurrency?.());
  if (configured) return configured;

  return getUserCurrency();
}
