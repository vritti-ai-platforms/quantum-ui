import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type SerialFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name' | 'params'> & {
  name?: string;
  quantId: string;
};

// Pre-configured SelectFilter for filtering serials within a quant
export const SerialFilter = Object.assign(
  forwardRef<HTMLButtonElement, SerialFilterProps>(({ quantId, ...props }, ref) => (
    <SelectFilter
      ref={ref}
      name="serialId"
      label="Serial"
      placeholder="Select serial"
      optionsEndpoint="commerce-api/inventory-item-serials/select"
      params={{ quantId }}
      fieldKeys={{ valueKey: 'id', labelKey: 'serialNumber' }}
      {...props}
    />
  )),
  { displayName: 'SerialFilter', defaultLabel: 'Serial', defaultName: 'serialId' },
);
