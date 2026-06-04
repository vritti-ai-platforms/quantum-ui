import { useContext } from 'react';
import { ConfirmContext, type ConfirmContextValue } from '../context/ConfirmContext';

export type { ConfirmOptions } from '../context/ConfirmContext';

// Returns the confirm() function — falls back to window.confirm if no ConfirmProvider
export function useConfirm(): ConfirmContextValue['confirm'] {
  const context = useContext(ConfirmContext);
  if (!context) {
    // Fallback for module federation where context isn't shared across boundaries
    return async (options) => window.confirm(options?.description ?? options?.title ?? 'Are you sure?');
  }
  return context.confirm;
}
