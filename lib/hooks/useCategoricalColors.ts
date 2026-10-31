import { useContext, useMemo, useSyncExternalStore } from 'react';
import { ThemeContext, type ThemeMode } from '../context/ThemeContext';
import { type CategoricalColor, generateCategoricalColors } from '../utils/colors';

function subscribeToRootClass(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

const getRootMode = (): ThemeMode => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
const getServerMode = (): ThemeMode => 'light';

/**
 * Returns `count` generated categorical colors for the active theme (prefix-stable, so growing `count` never
 * repaints existing slots). Reads the mode from `ThemeProvider`; outside a provider it tracks the `.dark` class
 * on `<html>`, which is what drives quantum-ui's theme tokens.
 */
export function useCategoricalColors(count: number): CategoricalColor[] {
  const context = useContext(ThemeContext);
  const rootMode = useSyncExternalStore(subscribeToRootClass, getRootMode, getServerMode);
  const mode = context?.theme ?? rootMode;
  return useMemo(() => generateCategoricalColors(count, mode), [count, mode]);
}
