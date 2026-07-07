import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type BillingCycleSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for billing cycle selection with async search
export const BillingCycleSelector = forwardRef<HTMLButtonElement, BillingCycleSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Billing Cycle"
    placeholder="Select billing cycle"
    searchable
    optionsEndpoint="select-api/billing-cycles"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
BillingCycleSelector.displayName = 'BillingCycleSelector';
