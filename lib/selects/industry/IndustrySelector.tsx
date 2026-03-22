import { forwardRef } from 'react';
import { Select, type SelectProps, type SelectSingleProps } from '../../components/Select/Select';

export interface IndustrySelectorProps extends Omit<SelectSingleProps, 'optionsEndpoint'> {}

// Pre-configured Select for industry selection with async search
export const IndustrySelector = forwardRef<HTMLButtonElement, IndustrySelectorProps>(
  ({ label = 'Industry', placeholder = 'Select industry', searchable = true, fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      {...({
        label,
        placeholder,
        searchable,
        optionsEndpoint: 'cloud-api/industries/select',
        fieldKeys: fieldKeys ?? { valueKey: 'id', labelKey: 'name' },
        ...props,
      } as SelectProps)}
    />
  ),
);
IndustrySelector.displayName = 'IndustrySelector';
