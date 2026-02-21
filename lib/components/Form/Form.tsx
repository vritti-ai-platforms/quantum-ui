import type { UseMutationResult } from '@tanstack/react-query';
import * as React from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type UseFormReturn,
} from 'react-hook-form';
import { cn } from '../../../shadcn/utils';
import { type FieldMapping, mapApiErrorsToForm } from '../../utils/formHelpers';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Switch } from '../Switch';

// Re-export Controller for explicit usage
export { Controller } from 'react-hook-form';

/**
 * Recursively process children to wrap form fields with Controller
 * and inject loading state into submit buttons
 */
function processChildren<
  TFieldValues extends FieldValues = FieldValues,
  _TContext = any,
  TTransformedValues extends FieldValues | undefined = TFieldValues,
>(
  children: React.ReactNode,
  control: ControllerProps<TFieldValues, FieldPath<TFieldValues>, TTransformedValues>['control'],
  isSubmitting: boolean,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    // Handle non-element children (strings, numbers, null, etc.)
    if (!React.isValidElement(child)) {
      return child;
    }

    const childProps = child.props as any;
    const isFragment = child.type === React.Fragment;

    // Handle form fields with name prop (but not Fragments)
    if (!isFragment && childProps.name && typeof childProps.name === 'string') {
      const name = childProps.name as FieldPath<TFieldValues>;

      return (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field, fieldState }) => {
            // Check if this is a Checkbox or Switch component - map value to checked
            const isCheckbox = child.type === Checkbox;
            const isSwitch = child.type === Switch;

            const fieldProps =
              isCheckbox || isSwitch
                ? {
                    checked: field.value,
                    onCheckedChange: field.onChange,
                    onBlur: field.onBlur,
                    ref: field.ref,
                  }
                : field;

            return React.cloneElement(child, {
              ...childProps,
              ...fieldProps,
              error: fieldState.error?.message || (fieldState.error ? 'Invalid' : undefined),
              name: undefined, // Remove name to avoid passing it to the underlying input
            });
          }}
        />
      );
    }

    // Handle submit buttons - inject loading state via isLoading prop
    if (childProps.type === 'submit') {
      const isButtonElement =
        child.type === Button || (typeof child.type === 'function' && (child.type as any).displayName === 'Button');

      if (isButtonElement) {
        return React.cloneElement(child, {
          ...childProps,
          isLoading: isSubmitting,
        });
      }
    }

    // Handle React Fragments - process their children directly
    if (isFragment) {
      return processChildren(childProps.children, control, isSubmitting);
    }

    // Recurse into children for container elements (divs, FieldGroups, etc.)
    if (childProps.children != null) {
      return React.cloneElement(child, {
        ...childProps,
        children: processChildren(childProps.children, control, isSubmitting),
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
  /**
   * The react-hook-form form instance
   */
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;

  /**
   * Form submit handler - receives the transformed values if transformation is applied.
   * Optional when using `mutation` prop.
   */
  onSubmit?: Parameters<UseFormReturn<TFieldValues, TContext, TTransformedValues>['handleSubmit']>[0];

  /**
   * Children elements - automatically wrapped with Controller if they have a name prop
   */
  children: React.ReactNode;

  /**
   * Whether to automatically display root errors
   * @default true
   */
  showRootError?: boolean;

  /**
   * Position of the root error display
   * @default 'bottom'
   */
  rootErrorPosition?: 'top' | 'bottom';

  /**
   * Additional classes for the root error display
   */
  rootErrorClassName?: string;

  /**
   * Action element rendered in the root error Alert (e.g. button or link)
   * Positioned in the top-right corner using AlertAction
   */
  rootErrorAction?: React.ReactNode;

  /**
   * Field mapping for automatic API error mapping
   * Maps API field names to form field names
   */
  fieldMapping?: FieldMapping;

  /**
   * TanStack Query mutation for automatic handling.
   * When provided, the form will use `mutateAsync` to submit data and handle errors automatically.
   * The mutation's own callbacks (onSuccess, onError, etc.) will fire automatically.
   * Form only adds `mapApiErrorsToForm` as an extra error handling layer.
   * Optional - you can use `onSubmit` instead for forms that don't use mutations.
   */
  mutation: UseMutationResult<TMutationData, TMutationError, TMutationVariables, unknown>;

  /**
   * Transform form data to mutation variables before submission.
   * Only used when `mutation` prop is provided.
   */
  transformSubmit?: (
    data: TTransformedValues extends undefined ? TFieldValues : TTransformedValues,
  ) => TMutationVariables;
}

/**
 * Smart Form component that automatically wraps children with Controller
 *
 * Usage with onSubmit:
 * ```tsx
 * <Form form={form} onSubmit={handleSubmit}>
 *   <TextField name="email" label="Email" description="Your email address" />
 *   <PasswordField name="password" label="Password" />
 *   <Button type="submit">Submit</Button>
 * </Form>
 * ```
 *
 * Usage with TanStack Query mutation:
 * ```tsx
 * const mutation = useMutation({
 *   mutationFn: (data) => api.post('/login', data),
 *   onSuccess: (data) => console.log('Success!', data),
 *   onError: (error) => console.error('Error!', error),
 * });
 *
 * <Form
 *   form={form}
 *   mutation={mutation}
 *   transformSubmit={(data) => ({ ...data, timestamp: Date.now() })}
 * >
 *   <TextField name="email" label="Email" />
 *   <Button type="submit">Submit</Button>
 * </Form>
 * ```
 */
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
  showRootError = false,
  rootErrorPosition = 'bottom',
  rootErrorClassName,
  rootErrorAction,
  fieldMapping,
  mutation,
  transformSubmit,
  ...props
}: FormProps<TFieldValues, TContext, TTransformedValues, TMutationData, TMutationError, TMutationVariables>) {
  // Compute isSubmitting from both form state and mutation state
  const isSubmitting = form.formState.isSubmitting || (mutation?.isPending ?? false);

  // Wrap the submit handler with automatic error mapping (always enabled)
  // Form only adds mapApiErrorsToForm - the mutation's own callbacks fire automatically
  const wrappedOnSubmit = React.useCallback(
    async (data: TTransformedValues extends undefined ? TFieldValues : TTransformedValues) => {
      try {
        if (mutation) {
          const variables = transformSubmit ? transformSubmit(data) : data;
          // mutateAsync will trigger the mutation's onSuccess/onError callbacks
          await mutation.mutateAsync(variables as TMutationVariables);
        } else if (onSubmit) {
          await onSubmit(data as any);
        }
      } catch (error) {
        // Form's only job: map API errors to form fields
        // mapApiErrorsToForm handles axios error structure extraction internally
        mapApiErrorsToForm(error, form as any, {
          fieldMapping,
          setRootError: showRootError,
        });
        // Log error for debugging
        console.error('[Form Submission Error]', error);
        // Error is swallowed, not re-thrown (mutation's onError already fired)
      }
    },
    [onSubmit, mutation, transformSubmit, fieldMapping, form, showRootError],
  );

  const handleSubmit = form.handleSubmit(wrappedOnSubmit as any);

  // Process children recursively to automatically wrap with Controller
  const processedChildren = processChildren(children, form.control, isSubmitting);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} {...props}>
        {/* Top position error */}
        {showRootError && rootErrorPosition === 'top' && form.formState.errors.root && (
          <Alert
            variant="destructive"
            title={form.formState.errors.root.type || 'Error'}
            description={form.formState.errors.root.message}
            action={rootErrorAction}
            className={cn('mb-4', rootErrorClassName)}
          />
        )}

        {processedChildren}

        {/* Bottom position error */}
        {showRootError && rootErrorPosition === 'bottom' && form.formState.errors.root && (
          <Alert
            variant="destructive"
            title={form.formState.errors.root.type || 'Error'}
            description={form.formState.errors.root.message}
            action={rootErrorAction}
            className={cn('mt-4', rootErrorClassName)}
          />
        )}
      </form>
    </FormProvider>
  );
}

Form.displayName = 'Form';
