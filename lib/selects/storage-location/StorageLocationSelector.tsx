import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type StorageLocationSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Renders the parent breadcrumb from an ltree path: main.sales.sales_rack_a.bin_1 → "Main › Sales › Sales Rack A"
// Drops the leaf segment because it's already shown as the option label.
export const formatStorageLocationPath = (path: string): string =>
  path
    .split('.')
    .slice(0, -1)
    .map((segment) => segment.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' › ');

// Pre-configured Select for storage location selection — server returns full ltree path as description
export const StorageLocationSelector = forwardRef<HTMLButtonElement, StorageLocationSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Storage Location"
    placeholder="Select location"
    searchable
    optionsEndpoint="commerce-api/storage-locations/select"
    fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'path' }}
    transformDescription={formatStorageLocationPath}
    {...props}
  />
));
StorageLocationSelector.displayName = 'StorageLocationSelector';
