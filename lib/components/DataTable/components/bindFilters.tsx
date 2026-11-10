import type React from 'react';
import { Children, cloneElement, isValidElement } from 'react';
import type { FilterCondition } from '../../../types/conditions';

type FilterElement = React.ReactElement<Record<string, unknown>>;

// Static props a filter component can carry so it works without a `name` / `label` prop
interface FilterStatics {
  defaultName?: string;
  defaultLabel?: string;
}

// Reads the statics off a function / forwardRef / memo component type
function filterStatics(el: FilterElement): FilterStatics {
  return typeof el.type === 'function' || typeof el.type === 'object' ? (el.type as FilterStatics) : {};
}

// Resolves a filter element's field: its `name` prop, else its component's `defaultName`
export function filterName(el: FilterElement): string | undefined {
  const { name } = el.props;
  return typeof name === 'string' ? name : filterStatics(el).defaultName;
}

// Resolves a filter element's label: its `label` prop, else its component's `defaultLabel`
export function filterLabel(el: FilterElement): string {
  const { label } = el.props;
  return typeof label === 'string' ? label : (filterStatics(el).defaultLabel ?? '');
}

export interface FilterBinding {
  conditions: FilterCondition[];
  onChange: (field: string, condition: FilterCondition | null) => void;
  /** Leaves a named element that already has a `value` prop to the page */
  keepControlled?: boolean;
  /** Fields whose controls are cloned with `clearable={false}` */
  required?: ReadonlySet<string>;
  loading?: boolean;
  /** Told, per field, whether its control is still settling its value (picking a first option, checking a held one) */
  onFieldSettling?: (field: string, settling: boolean) => void;
}

// Binds each named filter element to its condition, recursing through fragments and wrappers
export function bindFilters(children: React.ReactNode, binding: FilterBinding): React.ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as FilterElement;
    const name = filterName(el);

    if (name !== undefined) {
      if (binding.keepControlled && 'value' in el.props) return el;
      return cloneElement(el, {
        value: binding.conditions.find((c) => c.field === name) ?? null,
        onChange: (condition: FilterCondition | null | undefined) => binding.onChange(name, condition ?? null),
        ...(binding.required?.has(name) ? { clearable: false } : {}),
        ...(binding.loading ? { loading: true } : {}),
        ...(binding.onFieldSettling
          ? { onSettlingChange: (settling: boolean) => binding.onFieldSettling?.(name, settling) }
          : {}),
      });
    }

    if (el.props.children != null) {
      return cloneElement(el, { children: bindFilters(el.props.children as React.ReactNode, binding) });
    }

    return child;
  });
}
