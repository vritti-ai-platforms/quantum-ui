import { useLocation } from 'react-router-dom';
import { getWorkspaceCurrency, resolveCurrency } from '../utils/currency';

// Returns the ISO 4217 currency of the active workspace, re-resolving when the route changes (host resolver → user
// currency → null). Vritti hosts map org and site-group workspaces to the org default, legal entities and their sites
// to the legal entity's currency. Pass `siteId` on a screen about one site inside a site-group workspace to use that
// site's (legal entity's) currency instead.
export function useWorkspaceCurrency(siteId?: string | null): string | null {
  useLocation();
  return (siteId ? getWorkspaceCurrency(siteId) : null) ?? resolveCurrency();
}
