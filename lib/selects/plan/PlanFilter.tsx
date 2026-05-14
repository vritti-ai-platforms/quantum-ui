import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type PlanFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for plan filtering with async search
export const PlanFilter = Object.assign(
  forwardRef<HTMLButtonElement, PlanFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="planId"
      label="Plan"
      placeholder="Select plan"
      optionsEndpoint="select-api/plans"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'PlanFilter', defaultLabel: 'Plan', defaultName: 'planId' },
);
