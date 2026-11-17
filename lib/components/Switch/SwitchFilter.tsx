import type React from 'react';
import { useCallback, useId } from 'react';
import { Switch as ShadcnSwitch } from '../../../shadcn/shadcnSwitch';
import { cn } from '../../../shadcn/utils';
import type { FilterCondition } from '../../types/conditions';
import { withDisabledTip } from '../../utils/disabledTip';
import { lockedTip, PermissionLockIcon, usePermission } from '../PermissionGate';
import { CONTEXT_ANCHOR_CLASS, ContextAnchorLabel, type FilterMode } from '../Select/contextAnchor';
import { Skeleton } from '../Skeleton';

// The condition a SwitchFilter holds while on: the field equals 'true', the string a server boolean filter matches
export type SwitchFilterCondition = FilterCondition & { operator: 'equals'; value: 'true' };

export interface SwitchFilterProps {
  name: string;
  label: string;
  // `filter` (default) is an applied filter chip; `context` is a context-bar control — the label and a switch in a
  // quiet outlined control
  mode?: FilterMode;
  // On holds a SwitchFilterCondition; off is no condition, so `onChange` receives `null`
  value?: FilterCondition | null;
  onChange?: (value: SwitchFilterCondition | null) => void;
  loading?: boolean;
  disabled?: boolean;
  disabledTip?: string;
  permission?: string;
  className?: string;
}

// The filter-mode chip, matching the rest of the filter family
const FILTER_CHIP_CLASS =
  'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-colors';

// The whole control is the switch's label, so it takes the switch's focus ring and disabled look
const LABEL_STATE_CLASS =
  'cursor-pointer select-none has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:cursor-not-allowed has-disabled:opacity-50';

// On/off filter control holding a boolean condition — a chip in a filter panel, or a context control in a toolbar or a
// select's header
export const SwitchFilter: React.FC<SwitchFilterProps> = ({
  name,
  label,
  mode = 'filter',
  value,
  onChange,
  loading = false,
  disabled,
  disabledTip,
  permission,
  className,
}) => {
  const switchId = useId();
  const gate = usePermission(permission);
  const { granted, locked, reason } = gate;

  const handleCheckedChange = useCallback(
    (checked: boolean) => onChange?.(checked ? { field: name, operator: 'equals', value: 'true' } : null),
    [name, onChange],
  );

  if (!name) {
    return (
      <span className="inline-flex items-center rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">
        SwitchFilter: missing required `name` prop
      </span>
    );
  }

  // render = role: the role doesn't grant this filter, so the control doesn't exist for this user
  if (!granted) return null;

  // enable = role ∧ plan ∧ BU: granted but locked renders disabled with the upsell as its tooltip
  const isDisabled = disabled || locked;
  const tip = locked ? lockedTip(gate) : disabledTip;
  const checked = value?.value === 'true';
  const isContext = mode === 'context';

  return withDisabledTip(
    <label
      htmlFor={switchId}
      className={cn(
        isContext ? CONTEXT_ANCHOR_CLASS : FILTER_CHIP_CLASS,
        LABEL_STATE_CLASS,
        !isContext &&
          (checked
            ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
            : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground'),
        className,
      )}
    >
      {locked && <PermissionLockIcon reason={reason} className="size-3.5 shrink-0" />}
      {isContext ? <ContextAnchorLabel>{label}</ContextAnchorLabel> : <span className="truncate">{label}</span>}
      {loading ? (
        <Skeleton className="h-3.5 w-6 rounded-full" />
      ) : (
        // The label already rings and dims as a whole, so the switch drops its own ring and disabled opacity
        <ShadcnSwitch
          id={switchId}
          size="sm"
          checked={checked}
          onCheckedChange={handleCheckedChange}
          disabled={isDisabled}
          className={cn(
            'focus-visible:border-transparent focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-100',
            !isContext && 'data-[state=checked]:bg-primary-foreground/30',
          )}
        />
      )}
    </label>,
    tip,
    isDisabled,
  );
};

SwitchFilter.displayName = 'SwitchFilter';
