import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type BatchSelectorProps = Omit<SelectProps, 'optionsEndpoint' | 'params'> & {
  inventoryItemId: string;
};

export const BatchSelector = forwardRef<HTMLButtonElement, BatchSelectorProps>(({ inventoryItemId, ...props }, ref) => (
  <Select
    ref={ref}
    label="Batch"
    placeholder="Select batch"
    searchable
    optionsEndpoint="commerce-api/inventory-item-batches/select"
    params={{ inventoryItemId }}
    {...props}
  />
));

BatchSelector.displayName = 'BatchSelector';
