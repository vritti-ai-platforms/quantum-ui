import { deepEqual } from 'fast-equals';
import type React from 'react';
import { Children, cloneElement, isValidElement, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { FilterCondition } from '../../../types/table-filter';

type FilterFormValues = Record<string, FilterCondition | null | undefined>;

// Normalizes form values to a keyed map of FilterCondition, excluding null/undefined entries
function normalizeFormValues(values: FilterFormValues): Record<string, FilterCondition> {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v != null)) as Record<string, FilterCondition>;
}

// Normalizes active filters array to a keyed map
function normalizeActiveFilters(filters: FilterCondition[]): Record<string, FilterCondition> {
  return Object.fromEntries(filters.map((f) => [f.field, f]));
}

// Recursively processes children — wraps named fields with Controller
function processChildren(
  children: React.ReactNode,
  control: ReturnType<typeof useForm<FilterFormValues>>['control'],
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

    // Recurse into container children
    if (props.children != null) {
      return cloneElement(el, {
        ...props,
        children: processChildren(props.children as React.ReactNode, control),
      });
    }

    return child;
  });
}

interface FilterWrapperProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit: (data: FilterFormValues) => void | Promise<void>;
  onReset?: () => void;
  defaultValues?: FilterFormValues;
  activeFilters?: FilterCondition[];
  resetValues?: FilterFormValues;
  renderActions?: (opts: { isPending: boolean; isSubmitting: boolean }) => React.ReactNode;
  children: React.ReactNode;
}

// Form wrapper for filter panels — manages draft state via react-hook-form
export function FilterWrapper({
  onSubmit,
  onReset,
  defaultValues,
  activeFilters,
  resetValues,
  renderActions,
  children,
  ...props
}: FilterWrapperProps) {
  const form = useForm<FilterFormValues>({ defaultValues: defaultValues ?? {} });
  const isSubmitting = form.formState.isSubmitting;
  const formValues = form.watch();
  const isPending = !deepEqual(normalizeFormValues(formValues), normalizeActiveFilters(activeFilters ?? []));

  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  function handleReset() {
    form.reset(resetValues ?? {});
    onResetRef.current?.();
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} {...props}>
      {processChildren(children, form.control)}
      {renderActions?.({ isPending, isSubmitting })}
    </form>
  );
}

FilterWrapper.displayName = 'FilterWrapper';
