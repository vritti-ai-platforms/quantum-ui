import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { AlertCircle, FileQuestion, LogOut, ServerCrash, ShieldX } from 'lucide-react';
import type React from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../Button';

interface ErrorConfig {
  icon: React.ElementType;
  colorClass: string;
  title: string;
  description: string;
  showRetry: boolean;
  showGoBack: boolean;
  showLogin: boolean;
}

// Maps HTTP status codes to error display configurations
function getErrorConfig(status?: number): ErrorConfig {
  if (status === 401) {
    return {
      icon: LogOut,
      colorClass: 'destructive',
      title: 'Session Expired',
      description: 'Your session has expired. Please log in again.',
      showRetry: false,
      showGoBack: false,
      showLogin: true,
    };
  }

  if (status === 403) {
    return {
      icon: ShieldX,
      colorClass: 'warning',
      title: 'Access Denied',
      description: 'You do not have permission to view this resource.',
      showRetry: false,
      showGoBack: true,
      showLogin: false,
    };
  }

  if (status === 404) {
    return {
      icon: FileQuestion,
      colorClass: 'muted-foreground',
      title: 'Not Found',
      description: 'The resource you are looking for does not exist or has been moved.',
      showRetry: false,
      showGoBack: true,
      showLogin: false,
    };
  }

  if (status && status >= 500) {
    return {
      icon: ServerCrash,
      colorClass: 'destructive',
      title: 'Something Went Wrong',
      description: 'An unexpected server error occurred. Please try again.',
      showRetry: true,
      showGoBack: true,
      showLogin: false,
    };
  }

  return {
    icon: AlertCircle,
    colorClass: 'destructive',
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred.',
    showRetry: true,
    showGoBack: true,
    showLogin: false,
  };
}

// Renders status-specific error UI when a query throws
export const QueryErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const navigate = useNavigate();
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const config = getErrorConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-${config.colorClass}/15`}>
        <Icon className={`h-8 w-8 text-${config.colorClass}`} />
      </div>
      <div className="text-center space-y-1.5">
        <h2 className="text-lg font-semibold">{config.title}</h2>
        <p className="text-sm text-muted-foreground max-w-md">{config.description}</p>
      </div>
      <div className="flex gap-2">
        {config.showGoBack && (
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        )}
        {config.showRetry && <Button onClick={resetErrorBoundary}>Try Again</Button>}
        {config.showLogin && (
          <Button
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            Log In
          </Button>
        )}
      </div>
    </div>
  );
};

// Catches query errors and renders status-specific fallback UI
export const QueryErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} resetKeys={[pathname]} FallbackComponent={QueryErrorFallback}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
