import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type QuantItemSelectorProps = Omit<SelectProps, 'optionsEndpoint' | 'params'> & {
  quantId: string;
};

// Pre-configured Select for picking specific physical units (serials) within a quant.
// Returns only AVAILABLE quant items, scoped to the given quant.
export const QuantItemSelector = forwardRef<HTMLButtonElement, QuantItemSelectorProps>(
  ({ quantId, ...props }, ref) => (
    <Select
      ref={ref}
      label="Serial"
      placeholder="Select serial number"
      searchable
      optionsEndpoint="commerce-api/inventory-item-quant-items/select"
      params={{ quantId }}
      fieldKeys={{ valueKey: 'id', labelKey: 'serialNumber' }}
      {...props}
    />
  ),
);
QuantItemSelector.displayName = 'QuantItemSelector';
