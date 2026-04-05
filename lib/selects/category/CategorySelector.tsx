import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type CategorySelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for category selection with async search (supports single and multi-select)
export const CategorySelector = forwardRef<HTMLButtonElement, CategorySelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Category"
    placeholder="Select category"
    searchable
    optionsEndpoint="commerce-api/categories/select"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
CategorySelector.displayName = 'CategorySelector';
