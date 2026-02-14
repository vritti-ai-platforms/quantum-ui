import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

// Re-export types from context for backward compatibility
export type { ThemeMode } from '../context/ThemeContext';

/**
 * Return type for the useTheme hook
 */
export interface UseThemeReturn {
  /** Current theme mode ('light' or 'dark') */
  theme: 'light' | 'dark';
  /** Function to toggle between light and dark themes */
  toggleTheme: () => void;
  /** Function to set a specific theme */
  setTheme: (theme: 'light' | 'dark') => void;
}

/**
 * Hook for accessing theme state from the ThemeProvider context.
 *
 * Features:
 * - Access to centralized theme state
 * - Theme persistence handled by ThemeProvider
 * - System preference detection handled by ThemeProvider
 * - Automatic 'dark' class management on document root
 *
 * @throws Error if used outside of ThemeProvider
 * @returns Object containing current theme and functions to change it
 *
 * @example
 * ```tsx
 * // First, wrap your app with ThemeProvider
 * import { ThemeProvider } from '@vritti/quantum-ui';
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <MyComponent />
 *     </ThemeProvider>
 *   );
 * }
 *
 * // Then use the hook in any component
 * function MyComponent() {
 *   const { theme, toggleTheme, setTheme } = useTheme();
 *
 *   return (
 *     <div>
 *       <p>Current theme: {theme}</p>
 *       <button onClick={toggleTheme}>Toggle theme</button>
 *       <button onClick={() => setTheme('dark')}>Set dark</button>
 *     </div>
 *   );
 * }
 * ```
 */
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
