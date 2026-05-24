import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';
import type { SelectOption } from '../../components/Select/types';

export type SupplierSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

const DEFAULT_FIELD_KEYS = {
  valueKey: 'id',
  labelKey: 'name',
  additionalKeys: 'currencyCode,paymentTerms',
} as const;

function defaultTransformDescription(value: string, option: SelectOption): string {
  const currencyCode =
    typeof option.additionals?.currencyCode === 'string' ? option.additionals.currencyCode.trim() : '';
  const paymentTerms =
    typeof option.additionals?.paymentTerms === 'string' ? option.additionals.paymentTerms.trim() : '';
  const parts = [currencyCode, paymentTerms].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : value;
}

// Pre-configured Select for supplier selection with async search.
// Hits GET /commerce-api/suppliers/select. Default `additionalKeys` includes
// currencyCode + paymentTerms so callers can read them off the selected option
// without re-specifying. Description defaults to the supplier currency code.
export const SupplierSelector = forwardRef<HTMLButtonElement, SupplierSelectorProps>(({ fieldKeys, ...props }, ref) => (
  <Select
    ref={ref}
    label="Supplier"
    placeholder="Select supplier"
    searchable
    optionsEndpoint="commerce-api/suppliers/select"
    transformDescription={defaultTransformDescription}
    {...props}
    fieldKeys={{ ...DEFAULT_FIELD_KEYS, ...fieldKeys }}
  />
));
SupplierSelector.displayName = 'SupplierSelector';
