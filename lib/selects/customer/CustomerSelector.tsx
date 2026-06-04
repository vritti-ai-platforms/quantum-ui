import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type CustomerSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for customer selection with async search
export const CustomerSelector = forwardRef<HTMLButtonElement, CustomerSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Customer"
    placeholder="Search by name, phone, or email"
    searchable
    optionsEndpoint="commerce-api/customers/select"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
CustomerSelector.displayName = 'CustomerSelector';
