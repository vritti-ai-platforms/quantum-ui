// Theme sub-path export: consolidates theme items so MF host/remote share one context instance.
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

export const ThemeContext = ThemeContextImport;
export const ThemeProvider = ThemeProviderImport;
export const useTheme = useThemeImport;
export const ThemeToggle = ThemeToggleImport;

export type ThemeContextValue = ThemeContextValueType;
export type ThemeMode = ThemeModeType;
export type ThemeProviderProps = ThemeProviderPropsType;
export type UseThemeReturn = UseThemeReturnType;
export type ThemeToggleProps = ThemeTogglePropsType;
