import type React from 'react';
import { forwardRef } from 'react';
import { buttonVariants, Button as ShadcnButton } from '../../../shadcn/shadcnButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../shadcn/shadcnTooltip';
import { cn } from '../../../shadcn/utils';
import { Spinner } from '../Spinner';

export interface ButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  isLoading?: boolean;
  loadingText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  disabledTip?: string;
}

// Button with built-in loading state and adornment support
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
      className,
      asChild,
      ...props
    },
    ref,
  ) => {
    const isActuallyDisabled = disabled === true;

    const button = (
      <ShadcnButton
        ref={ref}
        asChild={asChild}
        disabled={disabled || isLoading}
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
            {startAdornment}
            {children}
            {endAdornment}
          </>
        )}
      </ShadcnButton>
    );

    if (!disabledTip || !isActuallyDisabled || asChild) {
      return button;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Disabled buttons do not emit hover/focus events, so the tooltip trigger lives on a wrapper. */}
            <span className="inline-flex max-w-full cursor-not-allowed">{button}</span>
          </TooltipTrigger>
          <TooltipContent>{disabledTip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
