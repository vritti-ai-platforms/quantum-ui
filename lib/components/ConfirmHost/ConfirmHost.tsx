import { CircleHelp, TriangleAlert } from 'lucide-react';
import { type ReactNode, useMemo, useSyncExternalStore } from 'react';
import type { DialogHandle } from '../../hooks/useDialog';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Dialog } from '../Dialog';

export interface ConfirmAlert {
  type: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  text: string;
}

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  alert?: ConfirmAlert;
  // Rich body rendered between the description and the action buttons (e.g. an impact breakdown)
  content?: ReactNode;
}

interface ResolvedConfirmOptions {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'default' | 'destructive';
  alert?: ConfirmAlert;
  content?: ReactNode;
}

const DEFAULT_CONFIRM_OPTIONS: ResolvedConfirmOptions = {
  title: 'Are you sure?',
  description: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
};

export type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

interface ConfirmState {
  open: boolean;
  options: ResolvedConfirmOptions;
}

interface ConfirmStore {
  getSnapshot: () => ConfirmState;
  subscribe: (listener: () => void) => () => void;
  confirm: ConfirmFn;
  cancel: () => void;
  accept: () => void;
}

function createConfirmStore(): ConfirmStore {
  let state: ConfirmState = { open: false, options: DEFAULT_CONFIRM_OPTIONS };
  let resolver: ((value: boolean) => void) | null = null;
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) listener();
  };
  const settle = (value: boolean) => {
    resolver?.(value);
    resolver = null;
    state = { ...state, open: false };
    emit();
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    confirm: (options) => {
      if (listeners.size === 0) {
        return Promise.resolve(window.confirm(options?.description || options?.title || 'Are you sure?'));
      }
      resolver?.(false);
      return new Promise<boolean>((resolve) => {
        resolver = resolve;
        state = { open: true, options: { ...DEFAULT_CONFIRM_OPTIONS, ...options } };
        emit();
      });
    },
    cancel: () => settle(false),
    accept: () => settle(true),
  };
}

export function getConfirmStore(): ConfirmStore {
  const g = globalThis as { __quantumUiConfirmStore?: ConfirmStore };
  if (!g.__quantumUiConfirmStore) g.__quantumUiConfirmStore = createConfirmStore();
  return g.__quantumUiConfirmStore;
}

export const ConfirmHost = () => {
  const store = getConfirmStore();
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const { options } = state;

  const handle: DialogHandle = useMemo(
    () => ({
      isOpen: state.open,
      open: () => {},
      close: store.cancel,
      onOpenChange: (val: boolean) => {
        if (!val) store.cancel();
      },
    }),
    [state.open, store],
  );

  return (
    <Dialog
      handle={handle}
      icon={options.variant === 'destructive' ? TriangleAlert : CircleHelp}
      iconVariant={options.variant}
      title={options.title}
      description={options.description}
    >
      {options.alert || options.content ? (
        <div className="mt-4 mb-6 flex flex-col gap-4 text-left">
          {options.alert ? <Alert variant={options.alert.type} description={options.alert.text} /> : null}
          {options.content ? <div>{options.content}</div> : null}
        </div>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" type="button" onClick={store.cancel}>
          {options.cancelLabel}
        </Button>
        <Button variant={options.variant} type="button" onClick={store.accept}>
          {options.confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
};
ConfirmHost.displayName = 'ConfirmHost';
