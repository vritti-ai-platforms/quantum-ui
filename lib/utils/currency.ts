import * as currencies from 'dinero.js/bigint/currencies';
import { getConfig } from '../config';
import { CUSTOM_CURRENCY_EXPONENTS, type CurrencyCode, isCurrencyCode } from './currencyCode';

export { type CurrencyCode, isCurrencyCode } from './currencyCode';

// A money amount: its currency and a major-unit amount string
export type CurrencyValue = { currency: CurrencyCode; value: string };

export function getCurrencyExponent(code: CurrencyCode): number {
  const custom = (CUSTOM_CURRENCY_EXPONENTS as Record<string, number | undefined>)[code];
  if (custom !== undefined) return custom;
  const currency = (currencies as Record<string, { exponent: bigint | number } | undefined>)[code];
  if (!currency) return 2;
  return Number(currency.exponent);
}

const WORKSPACE_CURRENCY_SUFFIX = '_currency';
const WORKSPACE_CURRENCY_PREFIX = 'vritti_';

const canUseStorage = () => typeof window !== 'undefined';

const normalizeCurrencyCode = (code: string | null | undefined): CurrencyCode | null => {
  const trimmed = code?.trim().toUpperCase();
  return isCurrencyCode(trimmed) ? trimmed : null;
};

const getWorkspaceCurrencyStorageKey = (workspaceId: string) =>
  `${WORKSPACE_CURRENCY_PREFIX}${workspaceId}${WORKSPACE_CURRENCY_SUFFIX}`;

// Records the currency a workspace (org, site group, legal entity or site) prices in, keyed by its id
export function setWorkspaceCurrency(workspaceId: string, code: CurrencyCode): void {
  if (!canUseStorage()) return;
  const normalizedWorkspaceId = workspaceId.trim();
  const normalized = normalizeCurrencyCode(code);
  if (!normalizedWorkspaceId || !normalized) return;
  localStorage.setItem(getWorkspaceCurrencyStorageKey(normalizedWorkspaceId), normalized);
}

export function getWorkspaceCurrency(workspaceId: string): CurrencyCode | null {
  if (!canUseStorage()) return null;
  const normalizedWorkspaceId = workspaceId.trim();
  if (!normalizedWorkspaceId) return null;
  return normalizeCurrencyCode(localStorage.getItem(getWorkspaceCurrencyStorageKey(normalizedWorkspaceId)));
}

// The active workspace's currency, or one site's when `siteId` is given, as the host resolves it; null when it has none
export function resolveCurrency(siteId?: string | null): CurrencyCode | null {
  return normalizeCurrencyCode(getConfig().currency.resolveCurrency?.(siteId));
}
