import { createContext, type ReactNode, useCallback, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';

// All fields optional — every one has a built-in default
export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

// Built-in defaults — used when neither the provider nor the caller provides a value
const DEFAULT_CONFIRM_OPTIONS: Required<ConfirmOptions> = {
  title: 'Are you sure?',
  description: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
};

export interface ConfirmContextValue {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);
ConfirmContext.displayName = 'ConfirmContext';

export interface ConfirmProviderProps {
  children: ReactNode;
  // Override built-in defaults library-wide (still overridden per call)
  defaultOptions?: ConfirmOptions;
}

// Renders a shared confirm dialog and exposes the imperative confirm() function
export const ConfirmProvider = ({ children, defaultOptions }: ConfirmProviderProps) => {
  const [state, setState] = useState<{ open: boolean; options: Required<ConfirmOptions> }>({
    open: false,
    options: DEFAULT_CONFIRM_OPTIONS,
  });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (options?: ConfirmOptions): Promise<boolean> => {
      // Resolve any in-flight promise defensively before replacing it
      resolverRef.current?.(false);
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        // Merge: built-in defaults -> provider defaults -> per-call options
        setState({
          open: true,
          options: { ...DEFAULT_CONFIRM_OPTIONS, ...defaultOptions, ...options },
        });
      });
    },
    [defaultOptions],
  );

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true);
    resolverRef.current = null;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const { options } = state;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title={options.title}
        description={options.description || undefined}
        footer={
          <>
            <Button variant="outline" type="button" onClick={handleCancel}>
              {options.cancelLabel}
            </Button>
            <Button variant={options.variant} type="button" onClick={handleConfirm}>
              {options.confirmLabel}
            </Button>
          </>
        }
      />
    </ConfirmContext.Provider>
  );
};
ConfirmProvider.displayName = 'ConfirmProvider';
