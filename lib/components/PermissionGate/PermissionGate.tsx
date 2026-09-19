import { Lock, LockKeyhole } from 'lucide-react';
import type React from 'react';
import { createContext, useContext } from 'react';
import { cn } from '../../../shadcn/utils';
import type { ScopeType, ServiceCode } from '../../types/catalog-resolver';
import { serviceLabels } from '../../utils/services';

export type PermissionLockReason = 'PLAN' | 'WORKSPACE' | 'SERVICE';

export interface PermissionGateResult {
  granted: boolean;
  locked: boolean;
  reason: PermissionLockReason | null;
  unlockPlans: string[];
  // Which external services the org still has to provision — only populated when reason is 'SERVICE'
  missingServices: ServiceCode[];
  available: boolean;
  featureName: string | null;
  // The workspace holding the lock — its name when the host resolved one, else its scope, so a
  // WORKSPACE lock can say which workspace rather than assuming a site
  workspaceLabel: string | null;
  workspaceScope: ScopeType | null;
}

export type PermissionGateFn = (code: string) => PermissionGateResult;

const ALLOW: PermissionGateResult = Object.freeze({
  granted: true,
  locked: false,
  reason: null,
  unlockPlans: [],
  missingServices: [],
  available: true,
  featureName: null,
  workspaceLabel: null,
  workspaceScope: null,
});

const ALLOW_GATE: PermissionGateFn = () => ALLOW;

const GATE_CONTEXT_KEY = Symbol.for('@vritti/quantum-ui/PermissionGate');
type GateRegistry = { [GATE_CONTEXT_KEY]?: React.Context<PermissionGateFn | null> };
const registry = globalThis as GateRegistry;
registry[GATE_CONTEXT_KEY] ??= createContext<PermissionGateFn | null>(null);
const PermissionGateContext = registry[GATE_CONTEXT_KEY];

export const PermissionGateProvider = PermissionGateContext.Provider;

// The raw gate for mapping over collections; ALLOW-everything when no provider is mounted
export function usePermissionGate(): PermissionGateFn {
  return useContext(PermissionGateContext) ?? ALLOW_GATE;
}

// Total: no provider / no code resolves to ALLOW, so callers never branch on null
export function usePermission(code?: string): PermissionGateResult {
  const gate = useContext(PermissionGateContext);
  return code && gate ? gate(code) : ALLOW;
}

// The lock symbol for a locked control — plan locks show a warning lock, workspace locks a red keyhole
// lock, service locks a red lock (blocked until the org provisions it, not an entitlement the user can buy)
export const PermissionLockIcon: React.FC<{ reason: PermissionLockReason | null; className?: string }> = ({
  reason,
  className,
}) => {
  switch (reason) {
    case 'WORKSPACE':
      return <LockKeyhole className={cn('text-destructive', className)} />;
    case 'SERVICE':
      return <Lock className={cn('text-destructive', className)} />;
    default:
      return <Lock className={cn('text-warning', className)} />;
  }
};

// Names the workspace a lock sits on: its own name when the host resolved one, else the noun for its
// scope, else a neutral fallback. A lock may sit on the org, legal entity, site group or site, so the
// copy must never assume a site.
const SCOPE_NOUN: Record<ScopeType, string> = {
  ORG: 'this organization',
  LE: 'this company',
  SITE_GROUP: 'this group',
  SITE: 'this outlet',
};

function workspaceNoun(label: string | null, scope: ScopeType | null): string {
  return label ?? (scope ? SCOPE_NOUN[scope] : 'this workspace');
}

// Shared tooltip copy for locked controls — upsell for plan locks, restriction notice for workspace
// locks, setup notice for service locks. A workspace lock may sit on the org, legal entity, site group
// or site, so the copy names the workspace rather than assuming a site.
export function lockedTip({
  reason,
  unlockPlans,
  missingServices = [],
  workspaceLabel = null,
  workspaceScope = null,
}: Pick<PermissionGateResult, 'reason' | 'unlockPlans'> &
  Partial<Pick<PermissionGateResult, 'missingServices' | 'workspaceLabel' | 'workspaceScope'>>): string {
  switch (reason) {
    case 'WORKSPACE':
      return `Not enabled for ${workspaceNoun(workspaceLabel, workspaceScope)}`;
    case 'SERVICE':
      return `Requires ${serviceLabels(missingServices)}`;
    default:
      return unlockPlans.length > 0 ? `Available in ${unlockPlans.join(', ')}` : 'Not included in your plan';
  }
}

// Resolves a blocked control's heading + description, keyed off the resolved feature name when known
function lockMessages(
  result: Pick<PermissionGateResult, 'granted' | 'reason' | 'unlockPlans' | 'featureName'> &
    Partial<Pick<PermissionGateResult, 'missingServices' | 'workspaceLabel' | 'workspaceScope'>>,
): {
  title: string;
  tip: string;
} {
  const name = result.featureName;
  if (!result.granted) {
    return {
      title: name ? `${name} is restricted` : 'No access',
      tip: name ? `You don't have permission to view ${name}.` : "You don't have permission to access this.",
    };
  }
  switch (result.reason) {
    case 'WORKSPACE': {
      const where = workspaceNoun(result.workspaceLabel ?? null, result.workspaceScope ?? null);
      return {
        title: name ? `${name} not enabled here` : 'Not available here',
        tip: name ? `${name} isn't enabled for ${where}.` : `Not enabled for ${where}.`,
      };
    }
    case 'SERVICE': {
      const needs = serviceLabels(result.missingServices ?? []);
      return {
        title: 'Setup required',
        tip: name ? `${name} needs ${needs}. Set it up to continue.` : `This needs ${needs}. Set it up to continue.`,
      };
    }
    default: {
      if (result.unlockPlans.length > 0) {
        const plans = result.unlockPlans.join(', ');
        return {
          title: name ? `Unlock ${name}` : 'Upgrade required',
          tip: name ? `${name} is available on ${plans}.` : `Available in ${plans}.`,
        };
      }
      return {
        title: name ? `Unlock ${name}` : 'Upgrade required',
        tip: name ? `${name} isn't included in your plan.` : 'Not included in your plan.',
      };
    }
  }
}

export interface PermissionGateProps {
  permission?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode | ((result: PermissionGateResult & { title: string; tip: string }) => React.ReactNode);
}

// Default fallback — a centered lock panel with the feature-specific restriction message
const DefaultLockFallback: React.FC<{ result: PermissionGateResult }> = ({ result }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
    <PermissionLockIcon reason={result.reason} className="size-10" />
    <p className="max-w-sm text-sm text-muted-foreground">{lockMessages(result).tip}</p>
  </div>
);

// Gates a subtree by permission code: children mount only when granted AND unlocked, else renders `fallback`
export const PermissionGate: React.FC<PermissionGateProps> = ({ permission, children, fallback }) => {
  const result = usePermission(permission);
  if (result.available) return <>{children}</>;
  if (fallback !== undefined)
    return <>{typeof fallback === 'function' ? fallback({ ...result, ...lockMessages(result) }) : fallback}</>;
  return <DefaultLockFallback result={result} />;
};
