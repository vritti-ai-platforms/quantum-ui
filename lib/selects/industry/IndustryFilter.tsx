import { forwardRef } from 'react';
import { SelectFilter } from '../../components/Select/SelectFilter';
import type { FilterResult, SelectValue } from '../../components/Select/types';

export interface IndustryFilterProps {
  field?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: FilterResult | SelectValue;
  onChange?: (result: FilterResult | null | undefined) => void;
  operator?: string;
  onOperatorChange?: (operator: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

// Pre-configured SelectFilter for industry filtering with async search
export const IndustryFilter = Object.assign(
  forwardRef<HTMLButtonElement, IndustryFilterProps>(
    ({ field = 'industryId', label = 'Industry', placeholder = 'Select industry', name, ...props }, ref) => (
      <SelectFilter
        ref={ref}
        field={field}
        name={name ?? field}
        label={label}
        placeholder={placeholder}
        optionsEndpoint="admin-api/industries/select"
        fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
        multiple={false}
        {...props}
      />
    ),
  ),
  { displayName: 'IndustryFilter', defaultLabel: 'Industry' },
);
