import { tz } from '@date-fns/tz';
import { format } from 'date-fns';
import { getConfig } from '../config';

const USER_TIMEZONE_STORAGE_KEY = 'vritti_user_timezone';
const WORKSPACE_TIMEZONE_SUFFIX = '_timezone';
const WORKSPACE_TIMEZONE_PREFIX = 'vritti_';

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

const getWorkspaceTimeZoneStorageKey = (workspaceId: string) =>
  `${WORKSPACE_TIMEZONE_PREFIX}${workspaceId}${WORKSPACE_TIMEZONE_SUFFIX}`;

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

// Records the IANA timezone a workspace runs in, keyed by its id
export function setWorkspaceTimeZone(workspaceId: string, timeZone: string): void {
  if (!canUseStorage()) return;
  const normalizedWorkspaceId = workspaceId.trim();
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  if (!normalizedWorkspaceId || !normalizedTimeZone) return;
  localStorage.setItem(getWorkspaceTimeZoneStorageKey(normalizedWorkspaceId), normalizedTimeZone);
}

export function getWorkspaceTimeZone(workspaceId: string): string | null {
  if (!canUseStorage()) return null;
  const normalizedWorkspaceId = workspaceId.trim();
  if (!normalizedWorkspaceId) return null;
  return normalizeTimeZone(localStorage.getItem(getWorkspaceTimeZoneStorageKey(normalizedWorkspaceId)));
}

export function resolveTimeZone(): string | null {
  const configuredTimeZone = normalizeTimeZone(getConfig().timeZone.resolveTimeZone?.());
  if (configuredTimeZone) return configuredTimeZone;

  return getUserTimeZone() ?? getBrowserTimeZone();
}

// Today as YYYY-MM-DD in the given IANA timezone, or the browser's when none is given
export function isoTodayDate(timeZone: string | null): string {
  return format(new Date(), 'yyyy-MM-dd', timeZone ? { in: tz(timeZone) } : undefined);
}
