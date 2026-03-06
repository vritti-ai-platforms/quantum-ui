import { useContext } from 'react';
import { ConfirmContext, type ConfirmContextValue } from '../context/ConfirmContext';

export type { ConfirmOptions } from '../context/ConfirmContext';

// Returns the confirm() function — must be used within ConfirmProvider
export function useConfirm(): ConfirmContextValue['confirm'] {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider.');
  }
  return context.confirm;
}
