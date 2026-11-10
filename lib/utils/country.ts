const ORG_COUNTRY_STORAGE_KEY = 'vritti_org_country';

const canUseStorage = () => typeof window !== 'undefined';

const normalizeCountryCode = (code: string | null | undefined): string | null => {
  const trimmed = code?.trim().toUpperCase();
  if (!trimmed) return null;
  return /^[A-Z]{2}$/.test(trimmed) ? trimmed : null;
};

// Records the ISO 3166-1 alpha-2 country of the organization the host is signed in to
export function setOrgCountryCode(code: string): void {
  if (!canUseStorage()) return;
  const normalized = normalizeCountryCode(code);
  if (!normalized) return;
  localStorage.setItem(ORG_COUNTRY_STORAGE_KEY, normalized);
}

// The organization's country as the host recorded it; null when it has recorded none
export function getOrgCountryCode(): string | null {
  if (!canUseStorage()) return null;
  return normalizeCountryCode(localStorage.getItem(ORG_COUNTRY_STORAGE_KEY));
}
