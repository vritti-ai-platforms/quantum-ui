import { Lock, LockKeyhole } from 'lucide-react';
import type React from 'react';
import { createContext, useContext } from 'react';
import { cn } from '../../../shadcn/utils';

// Why a granted permission is locked: the org's plan doesn't unlock it, or this business unit restricts it
export type PermissionLockReason = 'PLAN' | 'BU';

// Result of gating one permission code ("feature.permission", e.g. "uom.dim.add")
export interface PermissionGateResult {
  // The user's role grants it — gated controls render nothing when false
  granted: boolean;
  // Granted but plan/BU-locked — gated controls render disabled with an upsell when true
  locked: boolean;
  // Why it's locked — drives the lock symbol (PLAN = warning lock, BU = red keyhole lock)
  reason: PermissionLockReason | null;
  // Plan names that would unlock it — the upsell tooltip text (PLAN locks only)
  unlockPlans: string[];
}

// The contract an app installs: a pure, synchronous resolver over already-loaded permission state
export type PermissionGateFn = (code: string) => PermissionGateResult;

// Everything-allowed result — the no-op behavior when no permission system is installed
const ALLOW: PermissionGateResult = Object.freeze({ granted: true, locked: false, reason: null, unlockPlans: [] });

const ALLOW_GATE: PermissionGateFn = () => ALLOW;

// null = no permission system installed → `permission` props on components are inert.
// The context is registered on globalThis so every bundled copy of this module (module-federation host +
// remotes each inline their own chunk) resolves to the SAME context instance — otherwise a remote's gated
// components would never see the provider the host mounts.
const GATE_CONTEXT_KEY = Symbol.for('@vritti/quantum-ui/PermissionGate');
type GateRegistry = { [GATE_CONTEXT_KEY]?: React.Context<PermissionGateFn | null> };
const registry = globalThis as GateRegistry;
registry[GATE_CONTEXT_KEY] ??= createContext<PermissionGateFn | null>(null);
const PermissionGateContext = registry[GATE_CONTEXT_KEY];

// Mount once near the app root with the app's gate implementation (e.g. over the SSE permission payload)
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

// The lock symbol for a locked control — plan locks show a warning lock, BU locks a red keyhole lock
export const PermissionLockIcon: React.FC<{ reason: PermissionLockReason | null; className?: string }> = ({
  reason,
  className,
}) =>
  reason === 'BU' ? (
    <LockKeyhole className={cn('text-destructive', className)} />
  ) : (
    <Lock className={cn('text-warning', className)} />
  );

// Shared tooltip copy for locked controls — upsell for plan locks, restriction notice for BU locks
export function lockedTip({ reason, unlockPlans }: Pick<PermissionGateResult, 'reason' | 'unlockPlans'>): string {
  if (reason === 'BU') return 'Not enabled for this business unit';
  return unlockPlans.length > 0 ? `Available in ${unlockPlans.join(', ')}` : 'Not included in your plan';
}

export interface PermissionGateProps {
  // Permission code to gate on ("feature.permission", e.g. "uom.view"). Omit to always render children.
  permission?: string;
  children: React.ReactNode;
  // Rendered when access is unavailable (not granted, or granted-but-locked). A function form receives
  // the gate result so it can show the lock reason + upsell plans. Default: nothing when not granted,
  // a lock chip (with upsell tooltip) when locked.
  fallback?: React.ReactNode | ((result: PermissionGateResult) => React.ReactNode);
}

// Default locked indicator — the lock symbol whose tooltip explains the plan/BU restriction
const DefaultLockChip: React.FC<Pick<PermissionGateResult, 'reason' | 'unlockPlans'>> = ({ reason, unlockPlans }) => (
  <span className="inline-flex items-center gap-1 text-muted-foreground" title={lockedTip({ reason, unlockPlans })}>
    <PermissionLockIcon reason={reason} className="h-4 w-4" />
  </span>
);

// Gates a subtree by permission code: children mount ONLY when the code is granted AND unlocked, so
// their data queries never fire when the user lacks access. Renders `fallback` otherwise.
export const PermissionGate: React.FC<PermissionGateProps> = ({ permission, children, fallback }) => {
  const result = usePermission(permission);
  if (result.granted && !result.locked) return <>{children}</>;
  if (fallback !== undefined) return <>{typeof fallback === 'function' ? fallback(result) : fallback}</>;
  return result.locked ? <DefaultLockChip reason={result.reason} unlockPlans={result.unlockPlans} /> : null;
};
