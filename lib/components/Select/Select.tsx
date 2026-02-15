import * as React from 'react';
import { MultiSelect, type MultiSelectProps } from './components/MultiSelect/MultiSelect';
import { MultiSelectFilter, type MultiSelectFilterProps } from './components/MultiSelect/MultiSelectFilter';
import { SingleSelect, type SingleSelectProps } from './components/SingleSelect/SingleSelect';
import { SingleSelectFilter, type SingleSelectFilterProps } from './components/SingleSelect/SingleSelectFilter';
import type { SelectVariant } from './types';

interface SelectSingleProps extends SingleSelectProps {
  multiple?: false;
  type?: SelectVariant;
}

interface SelectMultiProps extends MultiSelectProps {
  multiple: true;
  type?: SelectVariant;
}

export type SelectProps = SelectSingleProps | SelectMultiProps;

// Unified select field supporting single/multi selection and default/filter variants
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  const { multiple, type = 'default', ...rest } = props;

  if (multiple) {
    if (type === 'filter') {
      return <MultiSelectFilter ref={ref} {...(rest as MultiSelectFilterProps)} />;
    }
    return <MultiSelect ref={ref} {...(rest as MultiSelectProps)} />;
  }

  if (type === 'filter') {
    return <SingleSelectFilter ref={ref} {...(rest as SingleSelectFilterProps)} />;
  }
  return <SingleSelect ref={ref} {...(rest as SingleSelectProps)} />;
}) as React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLButtonElement>>;

Select.displayName = 'Select';
