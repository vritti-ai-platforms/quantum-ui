import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, Loader2Icon, XCircleIcon } from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '../../lib/hooks/useTheme';

const Toaster = ({ theme, ...props }: ToasterProps) => {
  const { theme: activeTheme } = useTheme();
  return (
    <Sonner
      theme={(theme ?? activeTheme) as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CheckCircleIcon className="size-4 text-success" />,
        error: <XCircleIcon className="size-4 text-destructive" />,
        warning: <AlertTriangleIcon className="size-4 text-warning" />,
        info: <InfoIcon className="size-4 text-info" />,
        loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast: '!group toast shadow-lg',
          description: '!text-muted-foreground',
          actionButton: '!bg-primary text-primary-foreground',
          cancelButton: '!bg-muted text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
