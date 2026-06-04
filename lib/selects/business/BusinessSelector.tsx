import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type BusinessSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for business selection with async search
export const BusinessSelector = forwardRef<HTMLButtonElement, BusinessSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Business"
    placeholder="Select business"
    searchable
    optionsEndpoint="select-api/businesses"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
BusinessSelector.displayName = 'BusinessSelector';
