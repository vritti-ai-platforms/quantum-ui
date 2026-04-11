import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type UserFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for user filtering
export const UserFilter = Object.assign(
  forwardRef<HTMLButtonElement, UserFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="managerId"
      label="Manager"
      placeholder="Select user"
      optionsEndpoint="users/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'fullName', descriptionKey: 'email' }}
      {...props}
    />
  )),
  { displayName: 'UserFilter', defaultLabel: 'Manager' },
);
