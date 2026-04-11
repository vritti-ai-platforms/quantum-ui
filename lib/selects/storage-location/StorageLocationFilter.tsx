import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type StorageLocationFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

export const StorageLocationFilter = Object.assign(
	forwardRef<HTMLButtonElement, StorageLocationFilterProps>((props, ref) => (
		<SelectFilter
			ref={ref}
			name="locationId"
			label="Storage Location"
			placeholder="Select location"
			optionsEndpoint="commerce-api/storage-locations/select"
			fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
			{...props}
		/>
	)),
	{ displayName: 'StorageLocationFilter', defaultLabel: 'Storage Location' },
);
