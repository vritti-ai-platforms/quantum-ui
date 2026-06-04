import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type MicrofrontendSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for microfrontend selection with async search (supports single and multi-select)
export const MicrofrontendSelector = forwardRef<HTMLButtonElement, MicrofrontendSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Microfrontend"
    placeholder="Select microfrontend"
    searchable
    optionsEndpoint="select-api/microfrontends"
    {...props}
  />
));
MicrofrontendSelector.displayName = 'MicrofrontendSelector';
