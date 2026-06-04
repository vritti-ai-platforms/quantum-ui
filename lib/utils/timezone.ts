import { getConfig } from '../config';

const USER_TIMEZONE_STORAGE_KEY = 'vritti_user_timezone';
const BUSINESS_UNIT_TIMEZONE_SUFFIX = '_timezone';
const BUSINESS_UNIT_TIMEZONE_PREFIX = 'vritti_';

const canUseStorage = () => typeof window !== 'undefined';

const normalizeTimeZone = (timeZone: string | null | undefined): string | null => {
  const trimmed = timeZone?.trim();
  if (!trimmed) return null;

  try {
    void new Intl.DateTimeFormat('en-US', { timeZone: trimmed }).format(new Date());
    return trimmed;
  } catch {
    return null;
  }
};

const getBusinessUnitTimeZoneStorageKey = (businessUnitId: string) =>
  `${BUSINESS_UNIT_TIMEZONE_PREFIX}${businessUnitId}${BUSINESS_UNIT_TIMEZONE_SUFFIX}`;

const getBrowserTimeZone = (): string | null => {
  if (typeof Intl === 'undefined') return null;
  return normalizeTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
};

export function setUserTimeZone(timeZone: string): void {
  if (!canUseStorage()) return;
  const normalized = normalizeTimeZone(timeZone);
  if (!normalized) return;
  localStorage.setItem(USER_TIMEZONE_STORAGE_KEY, normalized);
}

export function getUserTimeZone(): string | null {
  if (!canUseStorage()) return null;
  return normalizeTimeZone(localStorage.getItem(USER_TIMEZONE_STORAGE_KEY));
}

export function setBusinessUnitTimeZone(businessUnitId: string, timeZone: string): void {
  if (!canUseStorage()) return;
  const normalizedBusinessUnitId = businessUnitId.trim();
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  if (!normalizedBusinessUnitId || !normalizedTimeZone) return;
  localStorage.setItem(getBusinessUnitTimeZoneStorageKey(normalizedBusinessUnitId), normalizedTimeZone);
}

export function getBusinessUnitTimeZone(businessUnitId: string): string | null {
  if (!canUseStorage()) return null;
  const normalizedBusinessUnitId = businessUnitId.trim();
  if (!normalizedBusinessUnitId) return null;
  return normalizeTimeZone(localStorage.getItem(getBusinessUnitTimeZoneStorageKey(normalizedBusinessUnitId)));
}

export function resolveTimeZone(): string | null {
  const configuredTimeZone = normalizeTimeZone(getConfig().timeZone.resolveTimeZone?.());
  if (configuredTimeZone) return configuredTimeZone;

  return getUserTimeZone() ?? getBrowserTimeZone();
}
