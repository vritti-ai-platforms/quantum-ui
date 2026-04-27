import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type QuantItemFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name' | 'params'> & {
  name?: string;
  quantId: string;
};

// Pre-configured SelectFilter for filtering physical units (serials) within a quant
export const QuantItemFilter = Object.assign(
  forwardRef<HTMLButtonElement, QuantItemFilterProps>(({ quantId, ...props }, ref) => (
    <SelectFilter
      ref={ref}
      name="quantItemId"
      label="Serial"
      placeholder="Select serial"
      optionsEndpoint="commerce-api/inventory-item-quant-items/select"
      params={{ quantId }}
      fieldKeys={{ valueKey: 'id', labelKey: 'serialNumber' }}
      {...props}
    />
  )),
  { displayName: 'QuantItemFilter', defaultLabel: 'Serial' },
);
