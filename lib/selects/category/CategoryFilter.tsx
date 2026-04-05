import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type CategoryFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for category filtering with async search
export const CategoryFilter = Object.assign(
  forwardRef<HTMLButtonElement, CategoryFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="categoryId"
      label="Category"
      placeholder="Select category"
      optionsEndpoint="commerce-api/categories/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'CategoryFilter', defaultLabel: 'Category' },
);
