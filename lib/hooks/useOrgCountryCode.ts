import { getOrgCountryCode } from '../utils/country';

// Returns the organization's ISO 3166-1 alpha-2 country as the host recorded it. Throws when the host recorded none: it
// must record the country with setOrgCountryCode before it renders an organization screen.
export function useOrgCountryCode(): string {
  const countryCode = getOrgCountryCode();
  if (!countryCode) {
    throw new Error('No organization country; record it with setOrgCountryCode before rendering');
  }
  return countryCode;
}
