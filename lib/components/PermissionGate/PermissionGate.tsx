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
  featureName: string | null;
}

export type PermissionGateFn = (code: string) => PermissionGateResult;

const ALLOW: PermissionGateResult = Object.freeze({
  granted: true,
  locked: false,
  reason: null,
  unlockPlans: [],
  available: true,
  featureName: null,
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

// Resolves a blocked control's heading + description, keyed off the resolved feature name when known
function lockMessages(result: Pick<PermissionGateResult, 'granted' | 'reason' | 'unlockPlans' | 'featureName'>): {
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
  if (result.reason === 'BU') {
    return {
      title: name ? `${name} not enabled here` : 'Not available here',
      tip: name ? `${name} isn't enabled for this business unit.` : 'Not enabled for this business unit.',
    };
  }
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
