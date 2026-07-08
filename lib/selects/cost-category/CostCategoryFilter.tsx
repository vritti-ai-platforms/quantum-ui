import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type CostCategoryFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

export const CostCategoryFilter = Object.assign(
  forwardRef<HTMLButtonElement, CostCategoryFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="categoryId"
      label="Category"
      placeholder="Select category"
      optionsEndpoint="commerce-api/select-api/cost-categories"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'CostCategoryFilter', defaultLabel: 'Category', defaultName: 'categoryId' },
);
