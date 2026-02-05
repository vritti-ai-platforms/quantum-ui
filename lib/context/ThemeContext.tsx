import {
  createContext,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Theme mode type - either 'light' or 'dark'
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Shape of the theme context value
 */
export interface ThemeContextValue {
  /** Current theme mode ('light' or 'dark') */
  theme: ThemeMode;
  /** Function to toggle between light and dark themes */
  toggleTheme: () => void;
  /** Function to set a specific theme */
  setTheme: (theme: ThemeMode) => void;
}

/**
 * Props for the ThemeProvider component
 */
export interface ThemeProviderProps {
  /** Child components that will have access to the theme context */
  children: ReactNode;
  /** Optional initial theme (defaults to system preference or localStorage) */
  defaultTheme?: ThemeMode;
  /** localStorage key for persisting theme preference */
  storageKey?: string;
}

const THEME_STORAGE_KEY = 'theme';

/**
 * Theme context for sharing theme state across components.
 * Use the useTheme hook to access this context.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);

ThemeContext.displayName = 'ThemeContext';

/**
 * Determines the initial theme based on localStorage and system preferences.
 * @param storageKey - The localStorage key to check for saved theme
 * @param defaultTheme - Optional default theme to use if no preference is found
 * @returns The determined initial theme
 */
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

/**
 * ThemeProvider component that manages theme state and provides it to the component tree.
 *
 * Features:
 * - Single source of truth for theme state
 * - Persists theme preference to localStorage
 * - Detects system color scheme preference on initial load
 * - Toggles the 'dark' class on document.documentElement
 * - Avoids flash of incorrect theme using useLayoutEffect
 *
 * @example
 * ```tsx
 * // Wrap your app with ThemeProvider
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 *
 * // With default theme
 * <ThemeProvider defaultTheme="dark">
 *   <YourApp />
 * </ThemeProvider>
 *
 * // With custom storage key
 * <ThemeProvider storageKey="my-app-theme">
 *   <YourApp />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    getInitialTheme(storageKey, defaultTheme)
  );

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
    [theme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

ThemeProvider.displayName = 'ThemeProvider';
