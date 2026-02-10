import { Spinner } from '../../Spinner';
import { Typography } from '../../Typography';
import type { OptionsLoaderProps } from '../types';

/**
 * OptionsLoader - Loading indicator for SingleSelect dropdown
 *
 * Displays a spinner with contextual message based on the operation type.
 *
 * @internal This component is for internal use within SingleSelect
 */
export const OptionsLoader = ({ isSearch }: OptionsLoaderProps) => {
  return (
    <div className="flex flex-row items-center gap-2 border-t p-2">
      <Spinner />
      <Typography variant="body2">{isSearch ? 'Searching...' : 'Loading options...'}</Typography>
    </div>
  );
};

OptionsLoader.displayName = 'OptionsLoader';
