import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type QuantFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for quant filtering; pass params={{ inventoryItemId }} to scope to a specific item
export const QuantFilter = Object.assign(
  forwardRef<HTMLButtonElement, QuantFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="quantId"
      label="Quant"
      placeholder="Select quant"
      optionsEndpoint="commerce-api/inventory-item-quants/select"
      {...props}
    />
  )),
  { displayName: 'QuantFilter', defaultLabel: 'Quant', defaultName: 'quantId' },
);
