export const TOAST_EVENT = 'quantum:toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'message' | 'loading';

export interface ToastOptions {
  description?: string;
  duration?: number;
  id?: string | number;
}

export interface PromiseToastOptions<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
  finally?: () => void;
}

export interface ToastEventDetail {
  type: ToastType;
  message: string;
  options?: ToastOptions;
}

// Generate unique toast ID
let toastIdCounter = 0;
export function generateToastId(): string {
  return `quantum-toast-${Date.now()}-${++toastIdCounter}`;
}

function emitToast(type: ToastType, message: string, options?: ToastOptions): void {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent<ToastEventDetail>(TOAST_EVENT, {
    detail: { type, message, options },
  });
  window.dispatchEvent(event);
}

export const toast = Object.assign(
  // Default toast (message type)
  (message: string, options?: ToastOptions) => emitToast('message', message, options),
  {
    success: (message: string, options?: ToastOptions) => emitToast('success', message, options),
    error: (message: string, options?: ToastOptions) => emitToast('error', message, options),
    warning: (message: string, options?: ToastOptions) => emitToast('warning', message, options),
    info: (message: string, options?: ToastOptions) => emitToast('info', message, options),
    message: (message: string, options?: ToastOptions) => emitToast('message', message, options),

    // Show loading toast, returns ID for manual updates
    loading: (message: string, options?: ToastOptions): string => {
      const id = options?.id?.toString() ?? generateToastId();
      emitToast('loading', message, { ...options, id });
      return id;
    },

    // Auto-handle loading → success/error for a promise
    promise: <T>(promise: Promise<T> | (() => Promise<T>), options: PromiseToastOptions<T>): Promise<T> => {
      const id = generateToastId();
      emitToast('loading', options.loading, { id });

      const p = typeof promise === 'function' ? promise() : promise;

      p.then((data) => {
        const message = typeof options.success === 'function' ? options.success(data) : options.success;
        emitToast('success', message, { id });
      })
        .catch((error) => {
          const message = typeof options.error === 'function' ? options.error(error) : options.error;
          emitToast('error', message, { id });
        })
        .finally(() => {
          options.finally?.();
        });

      return p;
    },
  },
);
