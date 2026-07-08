import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';
import type { SelectOption } from '../../components/Select/types';

export type CostCategorySelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

const DEFAULT_FIELD_KEYS = {
  valueKey: 'id',
  labelKey: 'name',
  descriptionKey: 'kind',
  additionalKeys: 'kind,code',
} as const;

function defaultTransformDescription(value: string, option: SelectOption): string {
  const kind = typeof option.additionals?.kind === 'string' ? option.additionals.kind : value;
  return kind || '';
}

// Pre-configured Select for cost-category selection, hitting GET /commerce-api/cost-categories/select.
export const CostCategorySelector = forwardRef<HTMLButtonElement, CostCategorySelectorProps>(
  ({ fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      label="Cost Category"
      placeholder="Select cost category"
      searchable
      optionsEndpoint="commerce-api/cost-categories/select"
      transformDescription={defaultTransformDescription}
      {...props}
      fieldKeys={{ ...DEFAULT_FIELD_KEYS, ...fieldKeys }}
    />
  ),
);
CostCategorySelector.displayName = 'CostCategorySelector';
