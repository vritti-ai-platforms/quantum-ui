import type React from 'react';
import { Children, cloneElement, isValidElement, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { FilterCondition } from '../../../types/table-filter';
import { Button } from '../../Button';

type FilterFormValues = Record<string, FilterCondition | null | undefined>;

// Recursively processes children — wraps named fields with Controller, injects isLoading into submit buttons, handles reset buttons
function processChildren(
  children: React.ReactNode,
  control: ReturnType<typeof useForm<FilterFormValues>>['control'],
  isSubmitting: boolean,
  onReset: () => void,
): React.ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    const el = child as React.ReactElement<Record<string, unknown>>;
    const props = el.props;

    // Named filter fields — wrap with Controller to inject value/onChange/fieldKey
    if (typeof props.name === 'string') {
      const name = props.name;
      return (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field }) =>
            cloneElement(el, {
              ...props,
              fieldKey: name,
              value: field.value,
              onChange: field.onChange,
            })
          }
        />
      );
    }

    // Submit buttons — inject isLoading
    if (
      props.type === 'submit' &&
      (el.type === Button ||
        (typeof el.type === 'function' && (el.type as { displayName?: string }).displayName === 'Button'))
    ) {
      return cloneElement(el, { ...props, isLoading: isSubmitting });
    }

    // Reset buttons — prevent HTML default, call form.reset({}) + onReset
    if (
      props.type === 'reset' &&
      (el.type === Button ||
        (typeof el.type === 'function' && (el.type as { displayName?: string }).displayName === 'Button'))
    ) {
      return cloneElement(el, { ...props, type: 'button', onClick: onReset });
    }

    // Recurse into container children
    if (props.children != null) {
      return cloneElement(el, {
        ...props,
        children: processChildren(props.children as React.ReactNode, control, isSubmitting, onReset),
      });
    }

    return child;
  });
}

interface FilterWrapperProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit: (data: FilterFormValues) => void | Promise<void>;
  onReset?: () => void;
  defaultValues?: FilterFormValues;
  children: React.ReactNode;
}

// Form wrapper for filter panels — manages draft state via react-hook-form
export function FilterWrapper({ onSubmit, onReset, defaultValues, children, ...props }: FilterWrapperProps) {
  const form = useForm<FilterFormValues>({ defaultValues: defaultValues ?? {} });
  const isSubmitting = form.formState.isSubmitting;

  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  function handleReset() {
    form.reset({});
    onResetRef.current?.();
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} {...props}>
      {processChildren(children, form.control, isSubmitting, handleReset)}
    </form>
  );
}

FilterWrapper.displayName = 'FilterWrapper';
