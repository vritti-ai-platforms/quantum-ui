import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type PlanSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for plan selection with async search
export const PlanSelector = forwardRef<HTMLButtonElement, PlanSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Plan"
    placeholder="Select plan"
    searchable
    optionsEndpoint="select-api/plans"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
PlanSelector.displayName = 'PlanSelector';
