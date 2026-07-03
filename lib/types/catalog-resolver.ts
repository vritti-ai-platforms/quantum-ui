// Frontend mirror of @vritti/api-sdk/catalog-resolver types — keep field-for-field in sync.
// Web apps import from HERE (quantum-ui), never from the server SDK.

export type PlatformBucket = 'web' | 'mobile';

export const PLATFORMS: PlatformBucket[] = ['web', 'mobile'];

export interface PlatformCodes {
  web?: string[];
  mobile?: string[];
}

export interface PlatformDenyCodes {
  web?: string[] | null;
  mobile?: string[] | null;
}

export type FeatureUnlocks = Record<string, PlatformCodes>;

export type BuFeatureLocks = Record<string, PlatformDenyCodes>;

export interface SnapshotPermission {
  code: string;
  label: string;
  isGlobal: boolean;
  businesses: string[];
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

export interface SnapshotFeature {
  code: string;
  name: string;
  lucideIcon: string;
  sfSymbol: string;
  materialSymbol: string;
  permissions: SnapshotPermission[];
  microfrontends: SnapshotMicrofrontends;
}

export interface SnapshotApp {
  code: string;
  name: string;
  icon: string;
  sortOrder: number;
  features: string[];
}

export interface SnapshotRoleTemplate {
  name: string;
  code: string;
  features: FeatureUnlocks;
}

export interface SnapshotPlan {
  code: string;
  name: string;
  isCustom: boolean;
  maxBusinessUnits: number | null;
  unlockedPermissions: FeatureUnlocks;
}

export interface SnapshotBusiness {
  name: string;
  apps: SnapshotApp[];
  roleTemplates: Record<string, SnapshotRoleTemplate>;
  plans: Record<string, SnapshotPlan>;
}

export interface VersionSnapshot {
  schemaVersion?: number;
  features: Record<string, SnapshotFeature>;
  businesses: Record<string, SnapshotBusiness>;
}

export const SNAPSHOT_SCHEMA_VERSION = 1;

export type LockReason = 'PLAN' | 'BU';

export interface CatalogPermission {
  code: string;
  locked: boolean;
  lockReason: LockReason | null;
  unlockPlans: string[];
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
  permissions: CatalogPermission[];
}

export type RoleItem = SnapshotRoleTemplate;

export interface BuMatrixCell {
  inPlan: boolean;
  selected: boolean;
  availableIn: string[];
}

export interface BuMatrixPermission {
  code: string;
  label: string;
  web: BuMatrixCell | null;
  mobile: BuMatrixCell | null;
}

export interface BuMatrixFeature {
  code: string;
  name: string;
  icon: string | null;
  platforms: PlatformBucket[];
  inPlan: boolean;
  availableIn: string[];
  permissions: BuMatrixPermission[];
}

export interface BuMatrixApp {
  code: string;
  name: string;
  icon: string | null;
  unlockedCount: number;
  totalCount: number;
  features: BuMatrixFeature[];
}

export interface BuMatrix {
  plan: { code: string; name: string };
  apps: BuMatrixApp[];
  locks: BuFeatureLocks;
}

export type RevokedGrants = Record<string, PlatformDenyCodes>;

export type ClientPlatform = 'web' | 'ios' | 'android';

export interface LockedPermission {
  code: string;
  reason: LockReason | null;
  unlockPlans: string[];
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
  lockedPermissions: LockedPermission[];
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
  buLocks: BuFeatureLocks | undefined;
  roleFeatures: FeatureUnlocks;
  platform: ClientPlatform;
}

export interface ComposeRoleGrantsParams {
  baseFeatures: FeatureUnlocks | undefined;
  additions: FeatureUnlocks;
  revoked: RevokedGrants | undefined;
}
