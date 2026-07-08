import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export type { ThemeMode } from '../context/ThemeContext';

export interface UseThemeReturn {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Hook for accessing theme state from the ThemeProvider context.
export function useTheme(): UseThemeReturn {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
        'Wrap your application with <ThemeProvider> to use the useTheme hook.',
    );
  }

  return context;
}
