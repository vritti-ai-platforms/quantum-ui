import { QueryErrorResetBoundary } from '@tanstack/react-query';
import type React from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';
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
        window.location.href = '/login';
      }}
    />
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
