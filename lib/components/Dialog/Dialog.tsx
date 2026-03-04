import type { UseMutationResult } from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
} from '../../../shadcn/shadcnDialog';
import type { FieldMapping } from '../../utils/formHelpers';
import { Button } from '../Button';
import { Form } from '../Form';

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
  // Form mode — wraps children+footer in a Form component
  mode?: 'default' | 'form';
  form?: UseFormReturn<any, any, any>;
  mutation?: UseMutationResult<any, any, any, any>;
  onFormSubmit?: (data: any) => Promise<void>;
  transformSubmit?: (data: any) => any;
  submitLabel?: string;
  cancelLabel?: string;
  showRootError?: boolean;
  fieldMapping?: FieldMapping;
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
  mode = 'default',
  form,
  mutation,
  onFormSubmit,
  transformSubmit,
  submitLabel,
  cancelLabel,
  showRootError,
  fieldMapping,
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

  // Render the body+footer content — shared between default and form modes
  const renderBody = () => {
    if (content) return content(closeDialog);

    if (mode === 'form' && form) {
      return (
        <Form
          form={form}
          mutation={mutation}
          onSubmit={onFormSubmit as any}
          transformSubmit={transformSubmit}
          showRootError={showRootError}
          fieldMapping={fieldMapping}
          className="space-y-4"
        >
          {children}
          <ShadcnDialogFooter>
            {footer ?? (
              <>
                <Button variant="outline" type="button" onClick={closeDialog}>
                  {cancelLabel ?? 'Cancel'}
                </Button>
                <Button type="submit">{submitLabel ?? 'Save'}</Button>
              </>
            )}
          </ShadcnDialogFooter>
        </Form>
      );
    }

    return (
      <>
        {children}
        {footer && <ShadcnDialogFooter>{footer}</ShadcnDialogFooter>}
      </>
    );
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
        {renderBody()}
      </ShadcnDialogContent>
    </ShadcnDialog>
  );
};

Dialog.displayName = 'Dialog';
