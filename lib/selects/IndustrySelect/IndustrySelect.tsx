import * as React from 'react';
import { Select } from '../../components/Select/Select';
import type { SelectOption, SelectValue, SelectVariant } from '../../components/Select/types';

export interface IndustrySelectProps {
  value?: SelectValue;
  onChange?: (value: SelectValue) => void;
  onOptionSelect?: (option: SelectOption | null) => void;
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
