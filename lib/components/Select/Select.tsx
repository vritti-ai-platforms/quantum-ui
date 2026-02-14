import * as React from 'react';
import { MultiSelect, type MultiSelectProps } from './components/MultiSelect/MultiSelect';
import { SingleSelect, type SingleSelectProps } from './components/SingleSelect/SingleSelect';

interface SelectSingleProps extends SingleSelectProps {
  multiple?: false;
}

interface SelectMultiProps extends MultiSelectProps {
  multiple: true;
}

export type SelectProps = SelectSingleProps | SelectMultiProps;

// Unified select field supporting single and multi-selection modes
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  if (props.multiple) {
    // Cast is safe: the discriminant `multiple` was checked above and removed via destructure.
    // TypeScript cannot narrow rest-spreads, so the assertion is required.
    const { multiple: _, ...multiProps } = props;
    return <MultiSelect ref={ref} {...(multiProps as MultiSelectProps)} />;
  }

  const { multiple: _, ...singleProps } = props;
  return <SingleSelect ref={ref} {...(singleProps as SingleSelectProps)} />;
}) as React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLButtonElement>>;

Select.displayName = 'Select';
