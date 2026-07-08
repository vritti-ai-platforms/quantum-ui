import type { UseMutationResult } from '@tanstack/react-query';
import type React from 'react';
import { Children, cloneElement, Fragment, isValidElement, useCallback } from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type UseFormReturn,
} from 'react-hook-form';
import type { Country } from 'react-phone-number-input';
import { cn } from '../../../shadcn/utils';
import { axios } from '../../utils/axios';
import { type FieldMapping, mapApiErrorsToForm } from '../../utils/formHelpers';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { CheckboxGroup } from '../CheckboxGroup';
import { DatePicker } from '../DatePicker';
import { DateTimePicker } from '../DateTimePicker';
import { PhoneField } from '../PhoneField';
import { RadioGroup } from '../RadioGroup';
import { Switch } from '../Switch';
import { UploadFile } from '../UploadFile';

// Re-export Controller for explicit usage
export { Controller } from 'react-hook-form';

// Recursively process children to wrap form fields with Controller and inject loading state into submit buttons
function processChildren<
  TFieldValues extends FieldValues = FieldValues,
  _TContext = any,
  TTransformedValues extends FieldValues | undefined = TFieldValues,
>(
  children: React.ReactNode,
  control: ControllerProps<TFieldValues, FieldPath<TFieldValues>, TTransformedValues>['control'],
  isSubmitting: boolean,
  setValue: UseFormReturn<TFieldValues, _TContext, TTransformedValues>['setValue'],
  onCancel?: () => void,
  reset?: UseFormReturn<TFieldValues, _TContext, TTransformedValues>['reset'],
): React.ReactNode {
  return Children.map(children, (child) => {
    // Handle non-element children (strings, numbers, null, etc.)
    if (!isValidElement(child)) {
      return child;
    }

    const childProps = child.props as any;
    const isFragment = child.type === Fragment;

    // Handle form fields with name prop (but not Fragments)
    if (!isFragment && childProps.name && typeof childProps.name === 'string') {
      const name = childProps.name as FieldPath<TFieldValues>;

      return (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field, fieldState }) => {
            // Check if this is a Checkbox, Switch, RadioGroup, or CheckboxGroup component
            const isCheckbox = child.type === Checkbox;
            const isSwitch = child.type === Switch;
            const isRadioGroup = child.type === RadioGroup;
            const isCheckboxGroup = child.type === CheckboxGroup;
            const isPhone = child.type === PhoneField;
            const isDatePicker = child.type === DatePicker;
            const isDateTimePicker = child.type === DateTimePicker;

            const fieldProps =
              isCheckbox || isSwitch
                ? {
                    checked: field.value,
                    onCheckedChange: field.onChange,
                    onBlur: field.onBlur,
                    ref: field.ref,
                  }
                : isRadioGroup || isCheckboxGroup
                  ? {
                      value: field.value,
                      onValueChange: field.onChange,
                      onBlur: field.onBlur,
                    }
                  : isDatePicker
                    ? {
                        value: field.value,
                        onValueChange: field.onChange,
                        onBlur: field.onBlur,
                        ref: field.ref,
                      }
                    : isDateTimePicker
                      ? {
                          value: field.value,
                          onValueChange: field.onChange,
                          onBlur: field.onBlur,
                          ref: field.ref,
                        }
                      : isPhone
                        ? {
                            ...field,
                            onCountryChange: (country: Country | undefined) => {
                              setValue(`${name}Country` as FieldPath<TFieldValues>, country as any);
                            },
                          }
                        : field;

            const isUploadFile = child.type === UploadFile;

            return cloneElement(child, {
              ...childProps,
              ...fieldProps,
              error: fieldState.error?.message || (fieldState.error ? 'Invalid' : undefined),
              name: undefined, // Remove name to avoid passing it to the underlying input
              ...(isUploadFile ? { isLoading: isSubmitting } : {}),
            });
          }}
        />
      );
    }

    // Handle cancel buttons - wire up form.reset() + onCancel callback
    if (childProps['data-cancel'] && onCancel && reset) {
      return cloneElement(child, {
        ...childProps,
        onClick: () => {
          reset();
          onCancel();
        },
      });
    }

    // Handle submit buttons - inject loading state via isLoading prop
    if (childProps.type === 'submit') {
      const isButtonElement =
        child.type === Button || (typeof child.type === 'function' && (child.type as any).displayName === 'Button');

      if (isButtonElement) {
        return cloneElement(child, {
          ...childProps,
          isLoading: isSubmitting,
        });
      }
    }

    // Handle React Fragments - process their children directly
    if (isFragment) {
      return processChildren(childProps.children, control, isSubmitting, setValue, onCancel, reset);
    }

    // Recurse into children for container elements (divs, FieldGroups, etc.)
    if (childProps.children != null) {
      return cloneElement(child, {
        ...childProps,
        children: processChildren(childProps.children, control, isSubmitting, setValue, onCancel, reset),
      });
    }

    // Return unchanged if no name prop and no children
    return child;
  });
}

export interface FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = TFieldValues,
  TMutationData = unknown,
  TMutationError = Error,
  TMutationVariables = any,
> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;

  onSubmit?: Parameters<UseFormReturn<TFieldValues, TContext, TTransformedValues>['handleSubmit']>[0];

  children: React.ReactNode;

  rootErrorPosition?: 'top' | 'bottom';

  rootErrorClassName?: string;

  rootErrorAction?: React.ReactNode;

  fieldMapping?: FieldMapping;

  mutation?: UseMutationResult<TMutationData, TMutationError, TMutationVariables, unknown>;

  transformSubmit?: (
    data: TTransformedValues extends undefined ? TFieldValues : TTransformedValues,
  ) => TMutationVariables;

  resetOnSuccess?: boolean;

  onCancel?: () => void;
}

// Smart Form component that automatically wraps children with Controller
export function Form<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = TFieldValues,
  TMutationData = unknown,
  TMutationError = Error,
  TMutationVariables = any,
>({
  form,
  onSubmit,
  children,
  rootErrorPosition = 'bottom',
  rootErrorClassName,
  rootErrorAction,
  fieldMapping,
  mutation,
  transformSubmit,
  resetOnSuccess,
  onCancel,
  className,
  ...props
}: FormProps<TFieldValues, TContext, TTransformedValues, TMutationData, TMutationError, TMutationVariables>) {
  // Compute isSubmitting from both form state and mutation state
  const isSubmitting = form.formState.isSubmitting || (mutation?.isPending ?? false);

  // Wrap the submit handler with automatic error mapping; the mutation's own callbacks fire automatically
  const wrappedOnSubmit = useCallback(
    async (data: TTransformedValues extends undefined ? TFieldValues : TTransformedValues) => {
      // Suppress error toasts during form submission — Form handles errors inline
      const interceptorId = axios.interceptors.request.use((config) => ({
        ...config,
        showErrorToast: false,
      }));

      try {
        if (mutation) {
          const variables = transformSubmit ? transformSubmit(data) : data;
          // mutateAsync will trigger the mutation's onSuccess/onError callbacks
          await mutation.mutateAsync(variables as TMutationVariables);
        } else if (onSubmit) {
          await onSubmit(data as any);
        }

        // Reset form after successful submission (default: true)
        if (resetOnSuccess !== false) form.reset();
      } catch (error) {
        // Map API errors to form fields — mapApiErrorsToForm extracts the axios error structure internally
        mapApiErrorsToForm(error, form as any, {
          fieldMapping,
        });
        // Log error for debugging
        console.error('[Form Submission Error]', error);
        // Error is swallowed, not re-thrown (mutation's onError already fired)
      } finally {
        axios.interceptors.request.eject(interceptorId);
      }
    },
    [onSubmit, mutation, transformSubmit, fieldMapping, form, resetOnSuccess],
  );

  const handleSubmit = form.handleSubmit(wrappedOnSubmit as any);

  // Process children recursively to automatically wrap with Controller
  const processedChildren = processChildren(children, form.control, isSubmitting, form.setValue, onCancel, form.reset);

  const childArray = Children.toArray(processedChildren);
  const actionsIndex = childArray.findIndex(
    (child) => isValidElement(child) && (child.type as { displayName?: string })?.displayName === 'DialogActions',
  );
  const hasActions = actionsIndex !== -1;
  const bodyChildren = hasActions ? childArray.filter((_, index) => index !== actionsIndex) : processedChildren;
  const actions = hasActions ? childArray[actionsIndex] : null;

  const topError =
    rootErrorPosition === 'top' && form.formState.errors.root ? (
      <Alert
        variant="destructive"
        title={form.formState.errors.root.type || 'Error'}
        description={form.formState.errors.root.message}
        action={rootErrorAction}
        className={cn('mb-4', rootErrorClassName)}
      />
    ) : null;
  const bottomError =
    rootErrorPosition === 'bottom' && form.formState.errors.root ? (
      <Alert
        variant="destructive"
        title={form.formState.errors.root.type || 'Error'}
        description={form.formState.errors.root.message}
        action={rootErrorAction}
        className={cn('mt-4', rootErrorClassName)}
      />
    ) : null;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit}
        className={cn(hasActions ? 'flex min-h-0 flex-1 flex-col' : 'space-y-4', className)}
        {...props}
      >
        {hasActions ? (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4 [scrollbar-gutter:stable]">
              {topError}
              {bodyChildren}
              {bottomError}
            </div>
            {actions}
          </>
        ) : (
          <>
            {topError}
            {processedChildren}
            {bottomError}
          </>
        )}
      </form>
    </FormProvider>
  );
}

Form.displayName = 'Form';
