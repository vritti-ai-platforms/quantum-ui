import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type CustomerFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for customer filtering with async search
export const CustomerFilter = Object.assign(
  forwardRef<HTMLButtonElement, CustomerFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="customerId"
      label="Customer"
      placeholder="Search by name, phone, or email"
      optionsEndpoint="commerce-api/customers/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'CustomerFilter', defaultLabel: 'Customer' },
);
