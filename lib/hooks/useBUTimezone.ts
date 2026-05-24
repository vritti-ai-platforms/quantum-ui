import { useLocation } from 'react-router-dom';
import { resolveTimeZone } from '../utils/timezone';

// Returns the IANA timezone resolved for the current route.
// Subscribes to route changes so consumers re-render when the active BU changes.
// Resolution order: host's configured `timeZone.resolveTimeZone` → user timezone → browser timezone.
export function useBUTimezone(): string | null {
  // Subscribe to URL changes so we re-resolve when the BU slug in the path changes.
  useLocation();
  return resolveTimeZone();
}
