const TIMEZONE_STORAGE_KEY = 'vritti_timezone';

export function setTimeZone(timeZone: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIMEZONE_STORAGE_KEY, timeZone);
}

export function getTimeZone(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TIMEZONE_STORAGE_KEY);
}
