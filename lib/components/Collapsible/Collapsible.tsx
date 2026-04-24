import { ChevronRight } from 'lucide-react';
import type React from 'react';
import {
  Collapsible as ShadcnCollapsible,
  CollapsibleContent as ShadcnCollapsibleContent,
  CollapsibleTrigger as ShadcnCollapsibleTrigger,
} from '../../../shadcn/shadcnCollapsible';
import { cn } from '../../../shadcn/utils';

export interface CollapsibleProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  triggerClassName?: string;
  showChevron?: boolean;
  /** Content rendered alongside the trigger but outside the clickable area (e.g. checkboxes, badges) */
  leading?: React.ReactNode;
  /** Content rendered after the trigger but outside the clickable area */
  trailing?: React.ReactNode;
  /** Class name for the header row that contains leading + trigger + trailing */
  headerClassName?: string;
}

// Renders a collapsible section with a trigger and expandable content
export function Collapsible({
  trigger,
  children,
  defaultOpen,
  open,
  onOpenChange,
  className,
  triggerClassName,
  showChevron = true,
  leading,
  trailing,
  headerClassName,
}: CollapsibleProps) {
  const hasHeader = leading || trailing;

  return (
    <ShadcnCollapsible defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange} className={className}>
      {hasHeader ? (
        <div className={cn('flex items-center gap-3', headerClassName)}>
          {leading}
          <ShadcnCollapsibleTrigger
            className={cn('flex items-center gap-1 flex-1 cursor-pointer group', triggerClassName)}
          >
            {showChevron && (
              <ChevronRight className="size-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-90" />
            )}
            {trigger}
          </ShadcnCollapsibleTrigger>
          {trailing}
        </div>
      ) : (
        <ShadcnCollapsibleTrigger className={cn('flex items-center gap-1 cursor-pointer group', triggerClassName)}>
          {showChevron && (
            <ChevronRight className="size-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-90" />
          )}
          {trigger}
        </ShadcnCollapsibleTrigger>
      )}
      <ShadcnCollapsibleContent>{children}</ShadcnCollapsibleContent>
    </ShadcnCollapsible>
  );
}

Collapsible.displayName = 'Collapsible';
