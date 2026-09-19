// Frontend mirror of @vritti/api-sdk/catalog-resolver types — keep field-for-field in sync

/**
 * The surfaces a permission can be granted on.
 *
 * `web` and `mobile` are UI buckets, reached by loading a microfrontend. `graphql` and `http` are
 * API surfaces a credential signs its own requests against — no microfrontend and no route, so a
 * headless feature is grantable there and nowhere else, and each surface is entitled independently.
 */
export type PlatformBucket = 'web' | 'mobile' | 'graphql' | 'http';

export const PLATFORMS: PlatformBucket[] = ['web', 'mobile', 'graphql', 'http'];

/** Buckets that reach their feature through a microfrontend, and so require one to resolve. */
export type UiPlatformBucket = 'web' | 'mobile';

export const UI_PLATFORMS: UiPlatformBucket[] = ['web', 'mobile'];

// The API surfaces an app credential can present — the values of core's `app_type` enum
export const API_SURFACES = ['GRAPHQL', 'HTTP'] as const;
export type ApiSurface = (typeof API_SURFACES)[number];

/** Buckets that admit an API credential rather than a person — exactly one per surface. */
export type ApiBucket = Exclude<PlatformBucket, UiPlatformBucket>;

export const API_BUCKETS: ApiBucket[] = ['graphql', 'http'];

export const SURFACE_BY_BUCKET: Record<ApiBucket, ApiSurface> = { graphql: 'GRAPHQL', http: 'HTTP' };
export const BUCKET_BY_SURFACE: Record<ApiSurface, ApiBucket> = { GRAPHQL: 'graphql', HTTP: 'http' };

export function isApiBucket(bucket: PlatformBucket): bucket is ApiBucket {
  return bucket === 'graphql' || bucket === 'http';
}

export interface PlatformCodes {
  web?: string[];
  mobile?: string[];
  graphql?: string[];
  http?: string[];
}

export interface PlatformDenyCodes {
  web?: string[] | null;
  mobile?: string[] | null;
  graphql?: string[] | null;
  http?: string[] | null;
}

export type FeatureUnlocks = Record<string, PlatformCodes>;

export type FeatureLocks = Record<string, PlatformDenyCodes>;
export type WorkspaceFeatureLocks = FeatureLocks;

export interface PermissionGroupRef {
  code: string;
  label: string;
  sortOrder: number;
}

export interface SnapshotPermission {
  code: string;
  label: string;
  isGlobal: boolean;
  businesses: string[];
  dependsOn: string[];
  platforms: PlatformBucket[];
  group?: string;
}

export interface SnapshotMicrofrontendWeb {
  code: string;
  name: string;
  remoteEntry: string;
  exposedModule: string;
  routePrefix: string;
}

export interface SnapshotMicrofrontendMobile {
  code: string;
  name: string;
  remoteEntryAndroid: string;
  remoteEntryIos: string;
  exposedModule: string;
  routePrefix: string;
}

export interface SnapshotMicrofrontends {
  web?: SnapshotMicrofrontendWeb;
  mobile?: SnapshotMicrofrontendMobile;
}

export type ScopeType = 'ORG' | 'LE' | 'SITE_GROUP' | 'SITE';
export type SiteType = 'OUTLET' | 'WAREHOUSE' | 'PRODUCTION';
export const SERVICE_CODES = ['GITEA'] as const;
export type ServiceCode = (typeof SERVICE_CODES)[number];
export interface SnapshotFeature {
  code: string;
  name: string;
  lucideIcon: string;
  sfSymbol: string;
  materialSymbol: string;
  scope: ScopeType;
  applicableSiteTypes: SiteType[];
  permissions: SnapshotPermission[];
  microfrontends: SnapshotMicrofrontends;
  requiredServices: ServiceCode[];
  permissionGroups: PermissionGroupRef[];
  // Strict — it decides which of the `graphql`/`http` buckets the feature offers at all
  apiSurfaces: ApiSurface[];
}

export interface SnapshotAppFeatureRef {
  code: string;
  scope: ScopeType;
}

export interface SnapshotApp {
  code: string;
  name: string;
  icon: string;
  sortOrder: number;
  features: SnapshotAppFeatureRef[];
}

export interface SnapshotRoleTemplate {
  name: string;
  code: string;
  scope: ScopeType;
  siteType: SiteType;
  features: FeatureUnlocks;
}

export interface SnapshotPlan {
  code: string;
  name: string;
  isCustom: boolean;
  maxSites: number | null;
  unlockedPermissions: FeatureUnlocks;
}

export interface VocabularyEntry {
  singular: string;
  plural: string;
}
export interface BusinessVocabulary {
  site?: VocabularyEntry;
  siteGroup?: VocabularyEntry;
  outlet?: VocabularyEntry;
  warehouse?: VocabularyEntry;
  production?: VocabularyEntry;
}
export interface SnapshotBusiness {
  name: string;
  vocabulary?: BusinessVocabulary;
  roleTemplates: Record<string, SnapshotRoleTemplate>;
  plans: Record<string, SnapshotPlan>;
}

export interface VersionSnapshot {
  schemaVersion?: number;
  // Flat feature dictionary keyed by `${scope}.${code}` (see snapshotFeatureKey) — same-code features at different scopes stay distinct
  features: Record<string, SnapshotFeature>;
  apps: SnapshotApp[];
  businesses: Record<string, SnapshotBusiness>;
}

// Composite key for the snapshot feature dictionary — feature identity is (scope, code)
export function snapshotFeatureKey(code: string, scope: ScopeType): string {
  return `${scope}.${code}`;
}

export const SNAPSHOT_SCHEMA_VERSION = 6;

export type LockReason = 'PLAN' | 'WORKSPACE' | 'SERVICE';

export interface CatalogPermission {
  code: string;
  locked: boolean;
  lockReason: LockReason | null;
  unlockPlans: string[];
  missingServices: ServiceCode[];
}

export interface FeatureCatalogEntry {
  code: string;
  name: string;
  lucideIcon: string | null;
  sfSymbol: string;
  materialSymbol: string;
  web: {
    remoteEntry: string;
    exposedModule: string;
    routePrefix: string;
  } | null;
  mobile: {
    remoteEntryAndroid: string;
    remoteEntryIos: string;
    exposedModule: string;
    routePrefix: string;
  } | null;
  appCode: string;
  appName: string;
  appIcon: string | null;
  appSortOrder: number;
  locked: boolean;
  lockReason: LockReason | null;
  unlockPlans: string[];
  missingServices: ServiceCode[];
  permissions: CatalogPermission[];
}

export type RoleItem = SnapshotRoleTemplate;

export interface SiteMatrixCell {
  inPlan: boolean;
  selected: boolean;
  availableIn: string[];
}

export interface SiteMatrixPermission {
  code: string;
  label: string;
  dependsOn: string[];
  group?: PermissionGroupRef;
  web: SiteMatrixCell | null;
  mobile: SiteMatrixCell | null;
  graphql: SiteMatrixCell | null;
  http: SiteMatrixCell | null;
}

export interface SiteMatrixFeature {
  code: string;
  name: string;
  icon: string | null;
  scope: ScopeType;
  applicableSiteTypes: SiteType[];
  platforms: PlatformBucket[];
  inPlan: boolean;
  availableIn: string[];
  // API surfaces the feature declares — lets the app-credential editor filter by credential type
  apiSurfaces: ApiSurface[];
  permissions: SiteMatrixPermission[];
}

export interface MatrixCounts {
  unlocked: number;
  total: number;
}

export interface SiteMatrixApp {
  code: string;
  name: string;
  icon: string | null;
  counts: Record<PlatformBucket, MatrixCounts>;
  features: SiteMatrixFeature[];
}

export interface SiteMatrix {
  plan: { code: string; name: string };
  apps: SiteMatrixApp[];
  locks: WorkspaceFeatureLocks;
}

export type RevokedGrants = Record<string, PlatformDenyCodes>;

export type ClientPlatform = 'web' | 'ios' | 'android' | 'graphql' | 'http';

export interface LockedPermission {
  code: string;
  reason: LockReason | null;
  unlockPlans: string[];
  missingServices: ServiceCode[];
}

export interface PlanUpsell {
  plan: string;
  features: string[];
}

export interface PermissionFeature {
  code: string;
  name: string;
  lucideIcon: string | null;
  sfSymbol: string;
  materialSymbol: string;
  permissions: string[];
  locked: boolean;
  lockReason: LockReason | null;
  unlockPlans: string[];
  // Which declared services the org has not provisioned — empty unless lockReason is 'SERVICE'
  missingServices: ServiceCode[];
  lockedPermissions: LockedPermission[];
  upsell: PlanUpsell[];
  route: {
    remoteEntry: string;
    exposedModule: string;
    routePrefix: string;
  };
  appCode: string;
  appName: string;
  appIcon: string | null;
  appSortOrder: number;
}

export interface ResolveUserFeaturesParams {
  snapshot: VersionSnapshot;
  businessCode: string;
  planCode: string | undefined;
  workspaceLocks: WorkspaceFeatureLocks | undefined;
  roleFeatures: FeatureUnlocks;
  platform: ClientPlatform;
}

export interface ComposeRoleGrantsParams {
  baseFeatures: FeatureUnlocks | undefined;
  additions: FeatureUnlocks;
  revoked: RevokedGrants | undefined;
}
