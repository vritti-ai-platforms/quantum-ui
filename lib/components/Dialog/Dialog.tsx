import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
} from '../../../shadcn/shadcnDialog';
import { cn } from '../../../shadcn/utils';
import type { DialogHandle } from '../../hooks/useDialog';

export interface DialogActionsProps {
  children: React.ReactNode;
  className?: string;
}

// Standard dialog/form action bar — a top divider with right-aligned buttons that stack on mobile.
// Use to wrap a form's submit/cancel buttons so every dialog shares the same footer layout.
export function DialogActions({ children, className }: DialogActionsProps) {
  return (
    <div className={cn('flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end', className)}>
      {children}
    </div>
  );
}

DialogActions.displayName = 'DialogActions';

export interface DialogProps {
  // Handle from useDialog() — controls open state and cleanup
  handle: DialogHandle;
  // anchor — render prop that receives open(); button renders outside DialogTrigger
  anchor?: (open: () => void) => React.ReactNode;
  // content — render prop that receives close()
  content?: (close: () => void) => React.ReactNode;
  // trigger — legacy ReactNode trigger (wrapped in DialogTrigger automatically)
  trigger?: React.ReactNode;
  // Required header icon — rendered as a badge before the title to standardize dialog headers.
  icon: LucideIcon;
  // Colour of the header icon badge. Use 'destructive' for delete/confirm-destructive dialogs.
  iconVariant?: 'default' | 'destructive';
  title: React.ReactNode;
  description: React.ReactNode;
  // Optional badge-style slot rendered inline with the title in the header.
  // Use for short status indicators tied to the dialog's subject (e.g. "Draft", "Derived unit").
  badgeSlot?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// Composite dialog — controlled by a useDialog() handle
export function Dialog({
  handle,
  anchor,
  content,
  trigger,
  icon: Icon,
  iconVariant = 'default',
  title,
  description,
  badgeSlot,
  children,
  footer,
  className,
}: DialogProps) {
  // Render the body — a `content` render-prop, or `children` plus an optional `footer`.
  const renderBody = () => {
    if (content) return content(handle.close);

    return (
      <>
        {children}
        {footer && <ShadcnDialogFooter>{footer}</ShadcnDialogFooter>}
      </>
    );
  };

  return (
    <ShadcnDialog open={handle.isOpen} onOpenChange={handle.onOpenChange}>
      {anchor ? anchor(handle.open) : trigger && <ShadcnDialogTrigger asChild>{trigger}</ShadcnDialogTrigger>}
      <ShadcnDialogContent className={className}>
        <ShadcnDialogHeader>
          <ShadcnDialogTitle>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  iconVariant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
                )}
              >
                <Icon className="size-4" />
              </span>
              <span>{title}</span>
              {badgeSlot}
            </span>
          </ShadcnDialogTitle>
          <ShadcnDialogDescription>{description}</ShadcnDialogDescription>
        </ShadcnDialogHeader>
        {renderBody()}
      </ShadcnDialogContent>
    </ShadcnDialog>
  );
}

Dialog.displayName = 'Dialog';
