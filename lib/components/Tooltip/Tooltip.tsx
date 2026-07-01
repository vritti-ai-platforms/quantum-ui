import type React from 'react';
import {
  Tooltip as ShadcnTooltip,
  TooltipContent as ShadcnTooltipContent,
  TooltipProvider as ShadcnTooltipProvider,
  TooltipTrigger as ShadcnTooltipTrigger,
} from '../../../shadcn/shadcnTooltip';

export interface TooltipProps {
  /** The hover content shown in the floating tooltip */
  content: React.ReactNode;
  /** The trigger element the tooltip is anchored to */
  children: React.ReactNode;
  /** Side the tooltip opens toward */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment along the trigger edge */
  align?: 'start' | 'center' | 'end';
  /** Extra classes for the content surface */
  className?: string;
  /** Hover delay before opening (ms) */
  delayDuration?: number;
  /** When true (default), the trigger renders as its child instead of a wrapping button */
  asChild?: boolean;
}

// Composed single-import tooltip — pass `content` for the hover text and wrap the trigger as children.
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  className,
  delayDuration = 200,
  asChild = true,
}) => (
  <ShadcnTooltipProvider delayDuration={delayDuration}>
    <ShadcnTooltip>
      <ShadcnTooltipTrigger asChild={asChild}>{children}</ShadcnTooltipTrigger>
      <ShadcnTooltipContent side={side} align={align} className={className}>
        {content}
      </ShadcnTooltipContent>
    </ShadcnTooltip>
  </ShadcnTooltipProvider>
);

Tooltip.displayName = 'Tooltip';
