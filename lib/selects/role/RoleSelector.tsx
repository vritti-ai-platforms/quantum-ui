import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type RoleSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for role selection with async search (supports single and multi-select)
export const RoleSelector = forwardRef<HTMLButtonElement, RoleSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Role"
    placeholder="Select role"
    searchable
    optionsEndpoint="select-api/roles"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
RoleSelector.displayName = 'RoleSelector';
