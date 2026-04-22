import type { Locale } from 'date-fns';
import { useEffect, useState } from 'react';
import { getLocale, resolveDateFnsLocale } from '../utils/locale';

export function useLocale(fallback = 'en-US'): Locale | undefined {
  const [locale, setLocale] = useState<Locale | undefined>(undefined);
  const localeCode = getLocale() ?? fallback;

  useEffect(() => {
    let mounted = true;
    void resolveDateFnsLocale(localeCode).then((resolved) => {
      if (mounted) setLocale(resolved);
    });

    return () => {
      mounted = false;
    };
  }, [localeCode]);

  return locale;
}
