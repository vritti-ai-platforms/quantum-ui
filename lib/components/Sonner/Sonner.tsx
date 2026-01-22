import { useEffect } from 'react';
import { toast as sonnerToast } from 'sonner';
import { Toaster as ShadcnToaster } from '../../../shadcn/shadcnSonner';
import { TOAST_EVENT, type ToastEventDetail } from './toast';

type ToasterProps = React.ComponentProps<typeof ShadcnToaster>;

/**
 * Toaster component that listens for global toast events.
 *
 * This component should be mounted once in the host application.
 * It listens for toast events emitted from any micro-frontend
 * and displays them using sonner.
 */
export const Toaster: React.FC<ToasterProps> = (props) => {
  useEffect(() => {
    const handleToast = (event: Event) => {
      const { type, message, options } = (event as CustomEvent<ToastEventDetail>).detail;

      switch (type) {
        case 'success':
          sonnerToast.success(message, options);
          break;
        case 'error':
          sonnerToast.error(message, options);
          break;
        case 'warning':
          sonnerToast.warning(message, options);
          break;
        case 'info':
          sonnerToast.info(message, options);
          break;
        case 'loading':
          sonnerToast.loading(message, options);
          break;
        default:
          sonnerToast(message, options);
          break;
      }
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  return <ShadcnToaster {...props} />;
};
