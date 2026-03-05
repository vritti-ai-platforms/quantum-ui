import { isAxiosError } from 'axios';
import { AlertCircle, LogOut, PackageX, ServerCrash, ShieldX, WifiOff } from 'lucide-react';
import type React from 'react';
import { cn } from '../../../shadcn/utils';
import { Button, type ButtonProps } from '../Button';

export type ErrorScreenKey =
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'serverError'
  | 'networkError'
  | 'unknownError';

export interface ErrorPagePreset {
  icon: React.ElementType;
  iconWrapperClassName: string;
  iconClassName: string;
  title: string;
  description: string;
  showRetry: boolean;
  showGoBack: boolean;
  showLogin: boolean;
}

export interface ErrorPageProps {
  preset: ErrorPagePreset;
  onRetry?: () => void;
  onGoBack?: () => void;
  onLogin?: () => void;
  retryLabel?: string;
  goBackLabel?: string;
  loginLabel?: string;
  retryVariant?: ButtonProps['variant'];
  goBackVariant?: ButtonProps['variant'];
  loginVariant?: ButtonProps['variant'];
  className?: string;
}

const ERROR_PAGE_PRESETS: Record<ErrorScreenKey, ErrorPagePreset> = {
  unauthorized: {
    icon: LogOut,
    iconWrapperClassName: 'bg-destructive/15',
    iconClassName: 'text-destructive',
    title: 'Session Expired',
    description: 'Your session has expired. Please log in again.',
    showRetry: false,
    showGoBack: false,
    showLogin: true,
  },
  forbidden: {
    icon: ShieldX,
    iconWrapperClassName: 'bg-warning/15',
    iconClassName: 'text-warning',
    title: 'Access Denied',
    description: 'You do not have permission to view this resource.',
    showRetry: false,
    showGoBack: true,
    showLogin: false,
  },
  notFound: {
    icon: PackageX,
    iconWrapperClassName: 'bg-primary/10 ring-1 ring-primary/20',
    iconClassName: 'text-primary',
    title: 'Not Found',
    description: 'The resource you are looking for does not exist or has been moved.',
    showRetry: false,
    showGoBack: true,
    showLogin: false,
  },
  serverError: {
    icon: ServerCrash,
    iconWrapperClassName: 'bg-destructive/15',
    iconClassName: 'text-destructive',
    title: 'Something Went Wrong',
    description: 'An unexpected server error occurred. Please try again.',
    showRetry: true,
    showGoBack: true,
    showLogin: false,
  },
  networkError: {
    icon: WifiOff,
    iconWrapperClassName: 'bg-warning/15',
    iconClassName: 'text-warning',
    title: 'Network Error',
    description: 'Unable to reach the server. Please check your connection and try again.',
    showRetry: true,
    showGoBack: true,
    showLogin: false,
  },
  unknownError: {
    icon: AlertCircle,
    iconWrapperClassName: 'bg-destructive/15',
    iconClassName: 'text-destructive',
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred.',
    showRetry: true,
    showGoBack: true,
    showLogin: false,
  },
};

export function getErrorPagePreset(screen: ErrorScreenKey): ErrorPagePreset {
  return ERROR_PAGE_PRESETS[screen];
}

export function resolveErrorScreen(error: unknown): ErrorScreenKey {
  if (isAxiosError(error)) {
    const status = error.response?.status;

    if (!error.response) return 'networkError';
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'forbidden';
    if (status === 404) return 'notFound';
    if (status && status >= 500) return 'serverError';
    return 'unknownError';
  }

  if (error instanceof Error) {
    if (error.message === 'No valid session') return 'unauthorized';
    if (error.message.toLowerCase().includes('network')) return 'networkError';
  }

  return 'unknownError';
}

export const ErrorPage = ({
  preset,
  onRetry,
  onGoBack,
  onLogin,
  retryLabel = 'Try Again',
  goBackLabel = 'Go Back',
  loginLabel = 'Log In',
  retryVariant = 'default',
  goBackVariant = 'outline',
  loginVariant = 'default',
  className,
}: ErrorPageProps) => {
  const Icon = preset.icon;

  return (
    <div className={cn('flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4', className)}>
      <div className={cn('flex items-center justify-center w-16 h-16 rounded-full', preset.iconWrapperClassName)}>
        <Icon className={cn('h-8 w-8', preset.iconClassName)} />
      </div>
      <div className="text-center space-y-1.5">
        <h2 className="text-lg font-semibold">{preset.title}</h2>
        <p className="text-sm text-muted-foreground max-w-md">{preset.description}</p>
      </div>
      <div className="flex gap-2">
        {preset.showGoBack && onGoBack && (
          <Button variant={goBackVariant} onClick={onGoBack}>
            {goBackLabel}
          </Button>
        )}
        {preset.showRetry && onRetry && (
          <Button variant={retryVariant} onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {preset.showLogin && onLogin && (
          <Button variant={loginVariant} onClick={onLogin}>
            {loginLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

type ScreenProps = Omit<ErrorPageProps, 'preset'>;

export const UnauthorizedErrorPage = (props: ScreenProps) => <ErrorPage preset={getErrorPagePreset('unauthorized')} {...props} />;
export const ForbiddenErrorPage = (props: ScreenProps) => <ErrorPage preset={getErrorPagePreset('forbidden')} {...props} />;
export const NotFoundErrorPage = (props: ScreenProps) => <ErrorPage preset={getErrorPagePreset('notFound')} {...props} />;
export const ServerErrorPage = (props: ScreenProps) => <ErrorPage preset={getErrorPagePreset('serverError')} {...props} />;
export const NetworkErrorPage = (props: ScreenProps) => <ErrorPage preset={getErrorPagePreset('networkError')} {...props} />;
export const UnknownErrorPage = (props: ScreenProps) => <ErrorPage preset={getErrorPagePreset('unknownError')} {...props} />;
