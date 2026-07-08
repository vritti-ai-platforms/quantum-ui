import { createContext, type ReactNode, useCallback, useLayoutEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

const THEME_STORAGE_KEY = 'theme';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

ThemeContext.displayName = 'ThemeContext';

// Determines the initial theme based on localStorage and system preferences.
function getInitialTheme(storageKey: string, defaultTheme?: ThemeMode): ThemeMode {
  // Check for saved theme in localStorage
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
  }

  // Use default theme if provided
  if (defaultTheme) {
    return defaultTheme;
  }

  // Fall back to system preference
  if (typeof window !== 'undefined') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  }

  // Ultimate fallback
  return 'light';
}

// ThemeProvider component that manages theme state and provides it to the component tree.
export function ThemeProvider({ children, defaultTheme, storageKey = THEME_STORAGE_KEY }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => getInitialTheme(storageKey, defaultTheme));

  // Apply theme to document on initial mount and when theme changes
  useLayoutEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  // Persist to localStorage whenever theme changes
  useLayoutEffect(() => {
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

ThemeProvider.displayName = 'ThemeProvider';
