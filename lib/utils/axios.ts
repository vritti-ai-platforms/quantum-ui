import Axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getConfig } from '../config';

// Extend AxiosRequestConfig with custom options
declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Skip auth for public endpoints (login, signup, etc.) */
    public?: boolean;
  }
}

// =============================================================================
// State
// =============================================================================

let accessToken: string | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let sessionRecoveryPromise: Promise<boolean> | null = null;
let csrfToken: string | null = null;
let csrfFetchPromise: Promise<string | null> | null = null;

// =============================================================================
// Token Management
// =============================================================================

export const setToken = (token: string): void => {
  if (token && typeof token === 'string') {
    accessToken = token;
  }
};

export const getToken = (): string | null => accessToken;

export const clearToken = (): void => {
  accessToken = null;
  cancelTokenRefresh();
};

// =============================================================================
// CSRF Token Management
// =============================================================================

export const setCsrfToken = (token: string): void => {
  if (token && typeof token === 'string') {
    csrfToken = token;
  }
};

export const getCsrfToken = (): string | null => csrfToken;

export const clearCsrfToken = (): void => {
  csrfToken = null;
};

// =============================================================================
// Session Recovery & Refresh
// =============================================================================

/** Recovers session from httpOnly cookie */
export async function recoverToken(): Promise<{ success: boolean; expiresIn: number }> {
  const config = getConfig();

  try {
    const response = await Axios.get<{ accessToken: string; expiresIn: number }>('/auth/token', {
      baseURL: config.axios.baseURL,
      withCredentials: true,
      timeout: config.axios.timeout,
    });

    if (response.data.accessToken) {
      setToken(response.data.accessToken);
      return { success: true, expiresIn: response.data.expiresIn };
    }

    return { success: false, expiresIn: 0 };
  } catch {
    clearToken();
    return { success: false, expiresIn: 0 };
  }
}

/** Auto-recovers session if no token (used by request interceptor) */
async function recoverTokenIfNeeded(): Promise<boolean> {
  if (accessToken) return true;

  if (sessionRecoveryPromise) {
    return sessionRecoveryPromise;
  }

  sessionRecoveryPromise = (async () => {
    try {
      const result = await recoverToken();
      if (result.success) {
        scheduleTokenRefresh(result.expiresIn);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      sessionRecoveryPromise = null;
    }
  })();

  return sessionRecoveryPromise;
}

/** Schedules proactive token refresh at 80% of token lifetime */
export function scheduleTokenRefresh(expiresIn: number): void {
  cancelTokenRefresh();

  const refreshAt = expiresIn * 0.8 * 1000;

  refreshTimer = setTimeout(async () => {
    const config = getConfig();

    try {
      const response = await Axios.post<{ accessToken: string; expiresIn: number }>(
        '/auth/refresh',
        {},
        {
          baseURL: config.axios.baseURL,
          withCredentials: true,
          timeout: config.axios.timeout,
        },
      );

      if (response.data.accessToken) {
        setToken(response.data.accessToken);
        scheduleTokenRefresh(response.data.expiresIn);
      }
    } catch {
      clearToken();
      redirectToLogin();
    }
  }, refreshAt);
}

export function cancelTokenRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

// =============================================================================
// CSRF Token Fetching
// =============================================================================

async function fetchCsrfToken(): Promise<string | null> {
  if (csrfFetchPromise) return csrfFetchPromise;

  csrfFetchPromise = (async () => {
    try {
      const config = getConfig();
      if (!config.csrf.enabled) return null;

      const response = await Axios.get(config.csrf.endpoint, {
        baseURL: config.axios.baseURL,
        withCredentials: config.axios.withCredentials,
        timeout: config.axios.timeout,
      });

      const token = response.data?.csrfToken;
      if (token && typeof token === 'string') {
        setCsrfToken(token);
        return token;
      }
      return null;
    } catch {
      return null;
    } finally {
      csrfFetchPromise = null;
    }
  })();

  return csrfFetchPromise;
}

// =============================================================================
// Helpers
// =============================================================================

function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;

  const parts = window.location.hostname.split('.');

  // localhost (e.g., acme.localhost)
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return parts[0];
  }

  // production (e.g., acme.vritti.cloud)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

// =============================================================================
// Axios Instance & Interceptors
// =============================================================================

function createAxiosInstance(): AxiosInstance {
  const config = getConfig();
  return Axios.create({
    baseURL: config.axios.baseURL,
    withCredentials: config.axios.withCredentials,
    headers: config.axios.headers,
    timeout: config.axios.timeout,
  });
}

export const axios: AxiosInstance = createAxiosInstance();

// Request interceptor: auto-recover session, add headers
axios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const quantumConfig = getConfig();
  const isPublicRequest = (config as { public?: boolean }).public === true;

  // Auto-recover session for protected requests
  if (!isPublicRequest) {
    const hasSession = await recoverTokenIfNeeded();
    if (!hasSession) {
      redirectToLogin();
      return Promise.reject(new Error('No valid session'));
    }
  }

  // Add Authorization header
  const token = getToken();
  if (token) {
    config.headers[quantumConfig.auth.tokenHeaderName] = `${quantumConfig.auth.tokenPrefix} ${token}`;
  }

  // Add tenant subdomain header
  const subdomain = getSubdomain();
  if (subdomain) {
    config.headers['x-subdomain'] = subdomain;
  }

  // Add CSRF token for state-changing requests
  const isStateChanging = ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '');

  if (isStateChanging && quantumConfig.csrf.enabled) {
    let csrf = getCsrfToken();
    if (!csrf) csrf = await fetchCsrfToken();
    if (csrf) config.headers[quantumConfig.csrf.headerName] = csrf;
  }

  return config;
});

// Response interceptor: handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicRequest = error.config?.public === true;

    if (error.response?.status === 401 && !isPublicRequest) {
      clearToken();
      cancelTokenRefresh();
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export default axios;
