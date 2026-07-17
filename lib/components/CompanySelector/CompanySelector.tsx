import { forwardRef } from 'react';
import { Select, type SelectProps } from '../Select/Select';

export type CompanySelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for company selection with async search
export const CompanySelector = forwardRef<HTMLButtonElement, CompanySelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Company"
    placeholder="Search companies"
    searchable
    optionsEndpoint="commerce-api/select-api/companies"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
CompanySelector.displayName = 'CompanySelector';
