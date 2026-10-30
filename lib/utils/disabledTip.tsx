import type React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../shadcn/shadcnTooltip';
import { cn } from '../../shadcn/utils';

// Wraps a disabled control so it still emits the hover/focus its tooltip needs, and explains why it is off.
// Full-width controls pass `wrapperClassName` (e.g. 'flex w-full') so the wrapper doesn't shrink them.
export function withDisabledTip(
  control: React.ReactElement,
  tip: string | undefined,
  disabled: boolean | undefined,
  wrapperClassName?: string,
): React.ReactElement {
  if (!tip || !disabled) return control;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Disabled controls emit no hover/focus events, so the trigger lives on a wrapper. */}
          <span className={cn('inline-flex cursor-not-allowed', wrapperClassName)}>{control}</span>
        </TooltipTrigger>
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
