import { CircleHelp, TriangleAlert } from 'lucide-react';
import { createContext, type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import type { DialogHandle } from '../hooks/useDialog';

export interface ConfirmAlert {
  type: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  text: string;
}

// All fields optional — every one has a built-in default
export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  alert?: ConfirmAlert;
}

interface ResolvedConfirmOptions {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'default' | 'destructive';
  alert?: ConfirmAlert;
}

// Built-in defaults — used when neither the provider nor the caller provides a value
const DEFAULT_CONFIRM_OPTIONS: ResolvedConfirmOptions = {
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
  const [state, setState] = useState<{ open: boolean; options: ResolvedConfirmOptions }>({
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

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true);
    resolverRef.current = null;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  // Build a DialogHandle-compatible object for the Dialog component
  const handle: DialogHandle = useMemo(
    () => ({
      isOpen: state.open,
      open: () => setState((prev) => ({ ...prev, open: true })),
      close: handleCancel,
      onOpenChange: (val: boolean) => {
        if (!val) handleCancel();
      },
    }),
    [state.open, handleCancel],
  );

  const { options } = state;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        handle={handle}
        icon={options.variant === 'destructive' ? TriangleAlert : CircleHelp}
        title={options.title}
        description={options.description}
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
      >
        {options.alert ? <Alert variant={options.alert.type} description={options.alert.text} /> : null}
      </Dialog>
    </ConfirmContext.Provider>
  );
};
ConfirmProvider.displayName = 'ConfirmProvider';
