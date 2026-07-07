import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type BillingCycleFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for billing cycle filtering with async search
export const BillingCycleFilter = Object.assign(
  forwardRef<HTMLButtonElement, BillingCycleFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="billingCycleId"
      label="Billing Cycle"
      placeholder="Select billing cycle"
      optionsEndpoint="select-api/billing-cycles"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'BillingCycleFilter', defaultLabel: 'Billing Cycle', defaultName: 'billingCycleId' },
);
