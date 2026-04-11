import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type StorageLocationSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

export const StorageLocationSelector = forwardRef<HTMLButtonElement, StorageLocationSelectorProps>((props, ref) => (
	<Select
		ref={ref}
		label="Storage Location"
		placeholder="Select location"
		searchable
		optionsEndpoint="commerce-api/storage-locations/select"
		fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
		{...props}
	/>
));
StorageLocationSelector.displayName = 'StorageLocationSelector';
