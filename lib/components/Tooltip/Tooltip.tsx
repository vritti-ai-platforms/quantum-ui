import type React from 'react';
import {
  Tooltip as ShadcnTooltip,
  TooltipContent as ShadcnTooltipContent,
  TooltipProvider as ShadcnTooltipProvider,
  TooltipTrigger as ShadcnTooltipTrigger,
} from '../../../shadcn/shadcnTooltip';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  delayDuration?: number;
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
