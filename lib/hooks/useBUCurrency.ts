import { useLocation } from 'react-router-dom';
import { resolveCurrency } from '../utils/currency';

// Returns the currency code (ISO 4217) resolved for the current route, re-resolving on route change (host resolver → user currency → null).
export function useBUCurrency(): string | null {
  // Subscribe to URL changes so we re-resolve when the BU slug in the path changes.
  useLocation();
  return resolveCurrency();
}
