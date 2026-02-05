/**
 * Theme sub-path export for @vritti/quantum-ui
 *
 * This module consolidates all theme-related exports into a single entry point.
 * This is critical for Module Federation - when host and remote microfrontends
 * import theme items from the same sub-path, they share the same context instance.
 *
 * @example
 * ```tsx
 * // Import all theme-related items from a single path
 * import {
 *   ThemeProvider,
 *   ThemeToggle,
 *   useTheme,
 *   ThemeContext
 * } from '@vritti/quantum-ui/theme';
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */

import type { ThemeToggleProps as ThemeTogglePropsType } from '../components/ThemeToggle/ThemeToggle';
// Import from components with aliases
import { ThemeToggle as ThemeToggleImport } from '../components/ThemeToggle/ThemeToggle';
// Import from context with aliases (following CLAUDE.md guidelines)
import {
  ThemeContext as ThemeContextImport,
  type ThemeContextValue as ThemeContextValueType,
  type ThemeMode as ThemeModeType,
  ThemeProvider as ThemeProviderImport,
  type ThemeProviderProps as ThemeProviderPropsType,
} from '../context/ThemeContext';
// Import from hooks with aliases
import { type UseThemeReturn as UseThemeReturnType, useTheme as useThemeImport } from '../hooks/useTheme';

// Export components with aliased imports (never direct re-exports)
export const ThemeContext = ThemeContextImport;
export const ThemeProvider = ThemeProviderImport;
export const useTheme = useThemeImport;
export const ThemeToggle = ThemeToggleImport;

// Export types
export type ThemeContextValue = ThemeContextValueType;
export type ThemeMode = ThemeModeType;
export type ThemeProviderProps = ThemeProviderPropsType;
export type UseThemeReturn = UseThemeReturnType;
export type ThemeToggleProps = ThemeTogglePropsType;
