import { useLocation } from 'react-router-dom';
import { resolveCurrency } from '../utils/currency';

// Returns the ISO 4217 currency of the active workspace as the host resolves it, re-resolving when the route changes.
// Pass `siteId` on a screen about one site to ask the host for that site's currency instead. Throws when the host
// resolves none: it must know every workspace's and site's currency before it renders a workspace screen.
export function useWorkspaceCurrency(siteId?: string | null): string {
  useLocation();
  const currency = resolveCurrency(siteId);
  if (!currency) {
    throw new Error(
      siteId
        ? `No currency for site ${siteId}; record it with setWorkspaceCurrency before rendering`
        : 'No currency for the active workspace; record it with setWorkspaceCurrency before rendering',
    );
  }
  return currency;
}
