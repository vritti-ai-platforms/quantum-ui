import type { UseMutationResult } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';
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
import { cn } from '../../../shadcn/utils';
import type { DialogHandle } from '../../hooks/useDialog';
import type { FieldMapping } from '../../utils/formHelpers';
import { Button } from '../Button';
import { Form, type FormProps } from '../Form';

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

export interface DialogProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = TFieldValues,
  TMutationData = unknown,
  TMutationError = Error,
  TMutationVariables = unknown,
> {
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
  title: React.ReactNode;
  description: React.ReactNode;
  // Optional badge-style slot rendered inline with the title in the header.
  // Use for short status indicators tied to the dialog's subject (e.g. "Draft", "Derived unit").
  badgeSlot?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  // Form mode — wraps children+footer in a Form component
  mode?: 'default' | 'form';
  form?: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  mutation?: UseMutationResult<TMutationData, TMutationError, TMutationVariables, unknown>;
  onFormSubmit?: FormProps<TFieldValues, TContext, TTransformedValues>['onSubmit'];
  transformSubmit?: FormProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TMutationData,
    TMutationError,
    TMutationVariables
  >['transformSubmit'];
  submitLabel?: string;
  cancelLabel?: string;
  fieldMapping?: FieldMapping;
}

// Composite dialog — controlled by a useDialog() handle
export function Dialog<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = TFieldValues,
  TMutationData = unknown,
  TMutationError = Error,
  TMutationVariables = unknown,
>({
  handle,
  anchor,
  content,
  trigger,
  icon: Icon,
  title,
  description,
  badgeSlot,
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
  fieldMapping,
}: DialogProps<TFieldValues, TContext, TTransformedValues, TMutationData, TMutationError, TMutationVariables>) {
  // Render the body+footer content — shared between default and form modes
  const renderBody = () => {
    if (content) return content(handle.close);

    if (mode === 'form' && form) {
      return (
        <Form
          form={form}
          mutation={mutation}
          onSubmit={onFormSubmit}
          transformSubmit={transformSubmit}
          fieldMapping={fieldMapping}
          className="space-y-4"
        >
          {children}
          <ShadcnDialogFooter>
            {footer ?? (
              <>
                <Button variant="outline" type="button" onClick={handle.close}>
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
    <ShadcnDialog open={handle.isOpen} onOpenChange={handle.onOpenChange}>
      {anchor ? anchor(handle.open) : trigger && <ShadcnDialogTrigger asChild>{trigger}</ShadcnDialogTrigger>}
      <ShadcnDialogContent className={className}>
        <ShadcnDialogHeader>
          <ShadcnDialogTitle>
            <span className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
