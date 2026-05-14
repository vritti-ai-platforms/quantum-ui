import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type BatchFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name' | 'params'> & {
  name?: string;
  inventoryItemId: string;
};

export const BatchFilter = Object.assign(
  forwardRef<HTMLButtonElement, BatchFilterProps>(({ inventoryItemId, ...props }, ref) => (
    <SelectFilter
      ref={ref}
      name="batchId"
      label="Batch"
      placeholder="Select batch"
      optionsEndpoint="commerce-api/inventory-item-quants/select"
      params={{ inventoryItemId }}
      {...props}
    />
  )),
  { displayName: 'BatchFilter', defaultLabel: 'Batch', defaultName: 'batchId' },
);
