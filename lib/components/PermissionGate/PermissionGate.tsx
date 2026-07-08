import { Lock, LockKeyhole } from 'lucide-react';
import type React from 'react';
import { createContext, useContext } from 'react';
import { cn } from '../../../shadcn/utils';

export type PermissionLockReason = 'PLAN' | 'BU';

export interface PermissionGateResult {
  granted: boolean;
  locked: boolean;
  reason: PermissionLockReason | null;
  unlockPlans: string[];
  available: boolean;
}

export type PermissionGateFn = (code: string) => PermissionGateResult;

const ALLOW: PermissionGateResult = Object.freeze({
  granted: true,
  locked: false,
  reason: null,
  unlockPlans: [],
  available: true,
});

const ALLOW_GATE: PermissionGateFn = () => ALLOW;

// Registered on globalThis so every bundled copy (MF host + remotes) resolves to one shared context instance
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

// Resolves a blocked control's heading + description for both not-granted and locked cases
function lockMessages(result: Pick<PermissionGateResult, 'granted' | 'reason' | 'unlockPlans'>): {
  title: string;
  tip: string;
} {
  if (!result.granted) return { title: 'No access', tip: "You don't have permission to access this." };
  return { title: result.reason === 'BU' ? 'Not available here' : 'Upgrade required', tip: lockedTip(result) };
}

export interface PermissionGateProps {
  permission?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode | ((result: PermissionGateResult & { title: string; tip: string }) => React.ReactNode);
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
  if (result.available) return <>{children}</>;
  if (fallback !== undefined)
    return <>{typeof fallback === 'function' ? fallback({ ...result, ...lockMessages(result) }) : fallback}</>;
  return result.locked ? <DefaultLockChip reason={result.reason} unlockPlans={result.unlockPlans} /> : null;
};
