import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type VersionSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for version selection with async search
export const VersionSelector = forwardRef<HTMLButtonElement, VersionSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Version"
    placeholder="Select version"
    searchable
    optionsEndpoint="select-api/versions"
    fieldKeys={{ valueKey: 'version', labelKey: 'name' }}
    {...props}
  />
));
VersionSelector.displayName = 'VersionSelector';
