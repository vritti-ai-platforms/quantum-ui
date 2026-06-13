import { type ConfirmFn, getConfirmStore } from '../components/ConfirmHost/ConfirmHost';

export type { ConfirmOptions } from '../components/ConfirmHost/ConfirmHost';

export function useConfirm(): ConfirmFn {
  return getConfirmStore().confirm;
}
