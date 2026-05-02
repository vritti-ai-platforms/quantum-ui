import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type BusinessFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for business filtering with async search
export const BusinessFilter = Object.assign(
  forwardRef<HTMLButtonElement, BusinessFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="businessId"
      label="Business"
      placeholder="Select business"
      optionsEndpoint="select-api/businesses"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'BusinessFilter', defaultLabel: 'Business' },
);
