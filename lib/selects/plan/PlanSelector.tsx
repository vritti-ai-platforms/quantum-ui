import { forwardRef } from 'react';
import { Select, type SelectProps, type SelectSingleProps } from '../../components/Select/Select';

export interface PlanSelectorProps extends Omit<SelectSingleProps, 'optionsEndpoint'> {}

// Pre-configured Select for plan selection with async search
export const PlanSelector = forwardRef<HTMLButtonElement, PlanSelectorProps>(
  ({ label = 'Plan', placeholder = 'Select plan', searchable = true, fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      {...({
        label,
        placeholder,
        searchable,
        optionsEndpoint: 'admin-api/plans/select',
        fieldKeys: fieldKeys ?? { valueKey: 'id', labelKey: 'name' },
        ...props,
      } as SelectProps)}
    />
  ),
);
PlanSelector.displayName = 'PlanSelector';
