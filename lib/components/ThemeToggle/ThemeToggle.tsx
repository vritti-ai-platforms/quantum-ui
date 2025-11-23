import React, { useLayoutEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
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

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 'md' }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useLayoutEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Update DOM and localStorage
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <Button
      variant='ghost'
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