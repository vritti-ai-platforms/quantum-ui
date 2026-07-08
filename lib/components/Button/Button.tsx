import type React from 'react';
import { forwardRef } from 'react';
import { buttonVariants, Button as ShadcnButton } from '../../../shadcn/shadcnButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../shadcn/shadcnTooltip';
import { cn } from '../../../shadcn/utils';
import { lockedTip, PermissionLockIcon, usePermission } from '../PermissionGate';
import { Spinner } from '../Spinner';

export interface ButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  isLoading?: boolean;
  loadingText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  disabledTip?: string;
  permission?: string;
}

// Button with built-in loading state, adornment support, and optional permission gating
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      isLoading = false,
      loadingText,
      startAdornment,
      endAdornment,
      disabled,
      disabledTip,
      permission,
      className,
      asChild,
      ...props
    },
    ref,
  ) => {
    const { granted, locked, reason, unlockPlans } = usePermission(permission);

    // render = role: the role doesn't grant this action, so the control doesn't exist for this user
    if (!granted) {
      return null;
    }

    // enable = role ∧ plan ∧ BU: granted but locked renders disabled with the upsell as its tooltip
    const lockTip = locked ? lockedTip({ reason, unlockPlans }) : undefined;
    const isActuallyDisabled = disabled === true || locked;

    const button = (
      <ShadcnButton
        ref={ref}
        asChild={asChild}
        disabled={disabled || isLoading || locked}
        aria-busy={isLoading}
        className={cn(isLoading && 'cursor-wait', className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {locked ? <PermissionLockIcon reason={reason} className="size-3.5" /> : startAdornment}
            {children}
            {endAdornment}
          </>
        )}
      </ShadcnButton>
    );

    const tip = lockTip ?? disabledTip;
    if (!tip || !isActuallyDisabled || asChild) {
      return button;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Disabled buttons do not emit hover/focus events, so the tooltip trigger lives on a wrapper. */}
            <span className="inline-flex max-w-full cursor-not-allowed">{button}</span>
          </TooltipTrigger>
          <TooltipContent>{tip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
