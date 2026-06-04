import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type VariantOptionSelectorProps = Omit<SelectProps, 'optionsEndpoint' | 'multiple'> & {
  catalogId: string;
};

const DEFAULT_FIELD_KEYS = { valueKey: 'id', labelKey: 'name' } as const;

// Pre-configured multi-select for variant options (dimensions) within a catalog, with async search
export const VariantOptionSelector = forwardRef<HTMLButtonElement, VariantOptionSelectorProps>(
  ({ catalogId, fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      label="Variant options"
      placeholder="Select dimensions (e.g. Size, Color)"
      searchable
      clearable
      {...props}
      multiple
      optionsEndpoint={`commerce-api/catalogs/${catalogId}/variant-options/select`}
      fieldKeys={{ ...DEFAULT_FIELD_KEYS, ...fieldKeys }}
    />
  ),
);
VariantOptionSelector.displayName = 'VariantOptionSelector';
