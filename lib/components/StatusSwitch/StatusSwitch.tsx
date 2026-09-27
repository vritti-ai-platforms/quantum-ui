import type React from 'react';
import { cn } from '../../../shadcn/utils';
import { CompactSwitch } from '../Switch';

export type StatusSwitchTone = 'success' | 'primary' | 'warning' | 'destructive';
export type StatusSwitchSize = 'sm' | 'md' | 'lg';

const TONES: Record<StatusSwitchTone, { pill: string; label: string; track: string }> = {
  success: {
    pill: 'border-success/40 bg-success/10',
    label: 'text-success',
    track: 'data-[state=checked]:bg-success',
  },
  primary: {
    pill: 'border-primary/40 bg-primary/10',
    label: 'text-primary',
    track: 'data-[state=checked]:bg-primary',
  },
  warning: {
    pill: 'border-warning/40 bg-warning/10',
    label: 'text-warning',
    track: 'data-[state=checked]:bg-warning',
  },
  destructive: {
    pill: 'border-destructive/40 bg-destructive/10',
    label: 'text-destructive',
    track: 'data-[state=checked]:bg-destructive',
  },
};

const SIZES: Record<StatusSwitchSize, { switchSize: 'sm' | 'default' | 'lg'; label: string; pill: string }> = {
  sm: { switchSize: 'sm', label: 'text-[10px]', pill: 'py-1 pr-1.5 pl-2.5' },
  md: { switchSize: 'default', label: 'text-[11px]', pill: 'py-1 pr-1.5 pl-3' },
  lg: { switchSize: 'lg', label: 'text-xs', pill: 'py-1.5 pr-2 pl-3.5' },
};

export interface StatusSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
  activeLabel?: string;
  inactiveLabel?: string;
  showLabels?: boolean;
  tone?: StatusSwitchTone;
  size?: StatusSwitchSize;
  permission?: string;
  disabled?: boolean;
  disabledTip?: string;
  isLoading?: boolean;
  className?: string;
}

// A switch that names the state it is in, for a row or header that toggles one flag. The label pair occupies one grid
// cell and slides, so the control never changes width as it flips and a column of them stays aligned.
export const StatusSwitch: React.FC<StatusSwitchProps> = ({
  checked,
  onCheckedChange,
  ariaLabel,
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
  showLabels = true,
  tone = 'success',
  size = 'sm',
  permission,
  disabled,
  disabledTip,
  isLoading,
  className,
}) => {
  const { pill, label, track } = TONES[tone];
  const dimensions = SIZES[size];
  // Saving is not a reason the control is unavailable, so it blocks input without claiming one
  const isBlocked = disabled || isLoading;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-dotted transition-colors duration-200',
        dimensions.pill,
        checked ? pill : 'border-border bg-transparent',
        isBlocked && 'opacity-60',
        className,
      )}
    >
      {showLabels && (
        <span aria-hidden className="grid justify-items-end">
          {[inactiveLabel, activeLabel].map((text, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed pair of slots, not a reorderable list
              key={index}
              className={cn(
                'col-start-1 row-start-1 select-none font-semibold uppercase leading-none tracking-[0.08em] transition-all duration-200',
                dimensions.label,
                checked === (index === 1) ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
                index === 1 ? label : 'text-muted-foreground',
              )}
            >
              {text}
            </span>
          ))}
        </span>
      )}
      <CompactSwitch
        size={dimensions.switchSize}
        className={track}
        checked={checked}
        permission={permission}
        disabled={isBlocked}
        disabledTip={disabled ? disabledTip : undefined}
        onCheckedChange={onCheckedChange}
        aria-label={ariaLabel}
      />
    </div>
  );
};

StatusSwitch.displayName = 'StatusSwitch';
