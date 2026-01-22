/**
 * Global toast event system for Module Federation compatibility.
 *
 * This module provides a toast API that works across micro-frontends by using
 * custom DOM events instead of direct sonner calls. The Toaster component
 * listens for these events and displays the toasts.
 */

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

/**
 * Toast API that works across Module Federation boundaries.
 *
 * @example
 * ```typescript
 * import { toast } from '@vritti/quantum-ui/Sonner';
 *
 * toast.success('Operation completed!');
 * toast.error('Something went wrong', { description: 'Please try again.' });
 * toast('Hello world'); // Default message toast
 *
 * // Loading toast with manual control
 * const id = toast.loading('Uploading...');
 * toast.success('Done!', { id }); // Updates the loading toast
 *
 * // Auto-handle promise states
 * toast.promise(asyncOperation(), {
 *   loading: 'Processing...',
 *   success: 'Done!',
 *   error: 'Failed',
 * });
 * ```
 */
export const toast = Object.assign(
  // Default toast (message type)
  (message: string, options?: ToastOptions) => emitToast('message', message, options),
  {
    success: (message: string, options?: ToastOptions) => emitToast('success', message, options),
    error: (message: string, options?: ToastOptions) => emitToast('error', message, options),
    warning: (message: string, options?: ToastOptions) => emitToast('warning', message, options),
    info: (message: string, options?: ToastOptions) => emitToast('info', message, options),
    message: (message: string, options?: ToastOptions) => emitToast('message', message, options),

    /**
     * Show loading toast, returns ID for manual updates
     *
     * @example
     * ```typescript
     * const id = toast.loading('Uploading...');
     * try {
     *   await uploadFile();
     *   toast.success('Uploaded!', { id });
     * } catch {
     *   toast.error('Failed', { id });
     * }
     * ```
     */
    loading: (message: string, options?: ToastOptions): string => {
      const id = options?.id?.toString() ?? generateToastId();
      emitToast('loading', message, { ...options, id });
      return id;
    },

    /**
     * Auto-handle loading → success/error for a promise
     *
     * @example
     * ```typescript
     * toast.promise(fetchData(), {
     *   loading: 'Fetching...',
     *   success: (data) => `Loaded ${data.count} items`,
     *   error: 'Failed to load',
     * });
     * ```
     */
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
