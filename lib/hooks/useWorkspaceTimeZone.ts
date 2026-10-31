import { useLocation } from 'react-router-dom';
import { getWorkspaceTimeZone, resolveTimeZone } from '../utils/timezone';

// Returns the IANA timezone of the active workspace, re-resolving when the route changes (host resolver → user
// timezone → browser timezone). Vritti hosts give sites their own timezone; org, site-group and legal-entity
// workspaces fall back to the user's. Pass `siteId` on a screen about one site inside an LE or site-group workspace to
// use that site's timezone instead.
export function useWorkspaceTimeZone(siteId?: string | null): string | null {
  useLocation();
  return (siteId ? getWorkspaceTimeZone(siteId) : null) ?? resolveTimeZone();
}
