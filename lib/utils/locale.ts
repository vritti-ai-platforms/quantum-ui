import type { Locale } from 'date-fns';

const LOCALE_STORAGE_KEY = 'vritti_locale';
const localeCache = new Map<string, Locale>();

export function setLocale(locale: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function getLocale(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCALE_STORAGE_KEY);
}

export async function resolveDateFnsLocale(localeCode: string): Promise<Locale | undefined> {
  const normalized = localeCode.toLowerCase();
  if (localeCache.has(normalized)) return localeCache.get(normalized);

  const candidates = [normalized, normalized.split('-')[0]];
  for (const candidate of candidates) {
    try {
      const mod = await import(`date-fns/locale/${candidate}`);
      const locale = (mod.default ?? Object.values(mod)[0]) as Locale;
      localeCache.set(normalized, locale);
      return locale;
    } catch {
      // try next candidate
    }
  }

  return undefined;
}
