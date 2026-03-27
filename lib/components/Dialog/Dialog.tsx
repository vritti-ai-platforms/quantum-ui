import type { UseMutationResult } from '@tanstack/react-query';
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
import type { DialogHandle } from '../../hooks/useDialog';
import type { FieldMapping } from '../../utils/formHelpers';
import { Button } from '../Button';
import { Form, type FormProps } from '../Form';

export interface DialogProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = TFieldValues,
  TMutationData = unknown,
  TMutationError = Error,
  TMutationVariables = any,
> {
  // Handle from useDialog() — controls open state and cleanup
  handle: DialogHandle;
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
  showRootError?: boolean;
  fieldMapping?: FieldMapping;
}

// Composite dialog — controlled by a useDialog() handle
export function Dialog<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = TFieldValues,
  TMutationData = unknown,
  TMutationError = Error,
  TMutationVariables = any,
>({
  handle,
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
          showRootError={showRootError}
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
}

Dialog.displayName = 'Dialog';
