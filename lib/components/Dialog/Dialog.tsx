import type React from 'react';
import { useState } from 'react';
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
} from '../../../shadcn/shadcnDialog';

export interface DialogProps {
  // Controlled mode — omit both to let Dialog manage its own state
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // anchor — render prop that receives open(); button renders outside DialogTrigger
  anchor?: (open: () => void) => React.ReactNode;
  // content — render prop that receives close()
  content?: (close: () => void) => React.ReactNode;
  // trigger — legacy ReactNode trigger (wrapped in DialogTrigger automatically)
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// Composite dialog — manages its own open state unless open/onOpenChange are provided
export const Dialog: React.FC<DialogProps> = ({
  open: controlledOpen,
  onOpenChange,
  anchor,
  content,
  trigger,
  title,
  description,
  children,
  footer,
  className,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const openDialog = () => {
    if (!isControlled) setInternalOpen(true);
    onOpenChange?.(true);
  };

  const closeDialog = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
  };

  const handleOpenChange = (val: boolean) => {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  };

  return (
    <ShadcnDialog open={isOpen} onOpenChange={handleOpenChange}>
      {anchor ? anchor(openDialog) : trigger && <ShadcnDialogTrigger asChild>{trigger}</ShadcnDialogTrigger>}
      <ShadcnDialogContent className={className}>
        {(title || description) && (
          <ShadcnDialogHeader>
            {title && <ShadcnDialogTitle>{title}</ShadcnDialogTitle>}
            {description && <ShadcnDialogDescription>{description}</ShadcnDialogDescription>}
          </ShadcnDialogHeader>
        )}
        {content ? content(closeDialog) : children}
        {footer && <ShadcnDialogFooter>{footer}</ShadcnDialogFooter>}
      </ShadcnDialogContent>
    </ShadcnDialog>
  );
};

Dialog.displayName = 'Dialog';
