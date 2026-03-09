import { forwardRef } from 'react';
import { Select } from '../../components/Select/Select';
import type { SelectOption, SelectValue } from '../../components/Select/types';

export interface RegionSelectorProps {
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
}

// Pre-configured Select for region selection with async search
export const RegionSelector = forwardRef<HTMLButtonElement, RegionSelectorProps>(
  ({ label = 'Region', placeholder = 'Select region', ...props }, ref) => (
    <Select
      ref={ref}
      label={label}
      placeholder={placeholder}
      searchable
      optionsEndpoint="admin-api/regions/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  ),
);
RegionSelector.displayName = 'RegionSelector';
