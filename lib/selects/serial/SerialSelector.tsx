import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type SerialSelectorProps = Omit<SelectProps, 'optionsEndpoint' | 'params'> & {
  quantId: string;
};

// Pre-configured Select for picking specific physical serials within a quant.
// Returns only AVAILABLE serials, scoped to the given quant.
export const SerialSelector = forwardRef<HTMLButtonElement, SerialSelectorProps>(
  ({ quantId, ...props }, ref) => (
    <Select
      ref={ref}
      label="Serial"
      placeholder="Select serial number"
      searchable
      optionsEndpoint="commerce-api/inventory-item-serials/select"
      params={{ quantId }}
      fieldKeys={{ valueKey: 'id', labelKey: 'serialNumber' }}
      {...props}
    />
  ),
);
SerialSelector.displayName = 'SerialSelector';
