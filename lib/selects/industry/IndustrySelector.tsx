import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type IndustrySelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for industry selection with async search
export const IndustrySelector = forwardRef<HTMLButtonElement, IndustrySelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Industry"
    placeholder="Select industry"
    searchable
    optionsEndpoint="select-api/industries"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
IndustrySelector.displayName = 'IndustrySelector';
