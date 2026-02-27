import type React from 'react';
import {
  Dialog as ShadcnDialog,
  DialogClose as ShadcnDialogClose,
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogHeader as ShadcnDialogHeader,
  DialogOverlay as ShadcnDialogOverlay,
  DialogPortal as ShadcnDialogPortal,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
} from '../../../shadcn/shadcnDialog';

// Dialog root — pass-through to Radix dialog root
export const DialogRoot = ShadcnDialog;
// Dialog trigger — opens the dialog on click
export const DialogTrigger = ShadcnDialogTrigger;
// Dialog portal — renders content outside DOM hierarchy
export const DialogPortal = ShadcnDialogPortal;
// Dialog overlay — backdrop behind dialog
export const DialogOverlay = ShadcnDialogOverlay;
// Dialog close — button to close the dialog
export const DialogClose = ShadcnDialogClose;
// Dialog content — styled modal container with built-in close button
export const DialogContent = ShadcnDialogContent;
// Dialog header — top section for title/description
export const DialogHeader = ShadcnDialogHeader;
// Dialog footer — bottom section for action buttons
export const DialogFooter = ShadcnDialogFooter;
// Dialog title — accessible dialog heading
export const DialogTitle = ShadcnDialogTitle;
// Dialog description — accessible dialog description
export const DialogDescription = ShadcnDialogDescription;

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// Composite dialog with convenience props for title, description, and footer
export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  className,
}) => (
  <DialogRoot open={open} onOpenChange={onOpenChange}>
    {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
    <DialogContent className={className}>
      {(title || description) && (
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      {children}
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </DialogContent>
  </DialogRoot>
);

Dialog.displayName = 'Dialog';
