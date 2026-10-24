import { QueryErrorResetBoundary } from '@tanstack/react-query';
import type React from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearToken } from '../../utils/axios';
import { ErrorPage, getErrorPagePreset, resolveErrorScreen } from './ErrorPage';

// Renders status-specific error UI when a query throws
export const QueryErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const navigate = useNavigate();
  const screen = resolveErrorScreen(error);
  const preset = getErrorPagePreset(screen);

  return (
    <ErrorPage
      preset={preset}
      onGoBack={() => navigate(-1)}
      onRetry={resetErrorBoundary}
      onLogin={() => {
        clearToken();
        window.location.href = '/login';
      }}
    />
  );
};

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Catches query errors and renders status-specific fallback UI, or the given fallback in its place
export const QueryErrorBoundary = ({ children, fallback }: QueryErrorBoundaryProps) => {
  const { pathname } = useLocation();

  return (
    <QueryErrorResetBoundary>
      {({ reset }) =>
        fallback === undefined ? (
          <ErrorBoundary onReset={reset} resetKeys={[pathname]} FallbackComponent={QueryErrorFallback}>
            {children}
          </ErrorBoundary>
        ) : (
          <ErrorBoundary onReset={reset} resetKeys={[pathname]} fallback={fallback}>
            {children}
          </ErrorBoundary>
        )
      }
    </QueryErrorResetBoundary>
  );
};
