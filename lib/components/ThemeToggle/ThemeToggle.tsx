import { Moon, Sun } from 'lucide-react';
import type React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../Button/Button';

export interface ThemeToggleProps {
  /**
   * Custom className for the toggle button
   */
  className?: string;

  /**
   * Size of the toggle button
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ThemeToggle component for switching between light and dark themes.
 *
 * Uses the useTheme hook internally for theme state management.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle size="lg" className="custom-class" />
 * ```
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 'md' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size={size === 'md' ? 'default' : size}
      onClick={toggleTheme}
      className={`text-foreground ${className}`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}
    >
      <Sun
        className={`h-4 w-4 transition-all ${isDarkMode ? 'scale-0 -rotate-90' : 'scale-100 rotate-0'}`}
        aria-hidden
      />
      <Moon
        className={`absolute h-4 w-4 transition-all ${isDarkMode ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`}
        aria-hidden
      />
    </Button>
  );
};

ThemeToggle.displayName = 'ThemeToggle';
