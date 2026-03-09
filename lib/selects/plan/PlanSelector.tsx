import { forwardRef } from 'react';
import { Select } from '../../components/Select/Select';
import type { SelectOption, SelectValue } from '../../components/Select/types';

export interface PlanSelectorProps {
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

// Pre-configured Select for plan selection with async search
export const PlanSelector = forwardRef<HTMLButtonElement, PlanSelectorProps>(
  ({ label = 'Plan', placeholder = 'Select plan', ...props }, ref) => (
    <Select
      ref={ref}
      label={label}
      placeholder={placeholder}
      searchable
      optionsEndpoint="admin-api/plans/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  ),
);
PlanSelector.displayName = 'PlanSelector';
