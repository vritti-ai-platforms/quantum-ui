import * as React from 'react';
import { Select } from '../../Select/Select';
import type { SelectValue, SelectVariant } from '../../Select/types';

export interface IndustrySelectProps {
  value?: SelectValue;
  onChange?: (value: SelectValue) => void;
  onBlur?: () => void;
  name?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  className?: string;
  id?: string;
  type?: SelectVariant;
}

// Pre-configured Select for industry selection with async search
export const IndustrySelect = React.forwardRef<HTMLButtonElement, IndustrySelectProps>(
  ({ label = 'Industry', placeholder = 'Select industry', ...props }, ref) => {
    return (
      <Select
        ref={ref}
        label={label}
        placeholder={placeholder}
        searchable
        optionsEndpoint="cloud-api/industries/select"
        fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
        {...props}
      />
    );
  },
);

IndustrySelect.displayName = 'IndustrySelect';
