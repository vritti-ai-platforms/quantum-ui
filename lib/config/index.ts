/**
 * quantum-ui Configuration System
 *
 * This module provides a type-safe configuration system for quantum-ui,
 * similar to how Tailwind CSS uses tailwind.config.js
 *
 * @example
 * ```typescript
 * // In your project root: quantum-ui.config.ts
 * import { defineConfig } from '@vritti/quantum-ui'
 *
 * export default defineConfig({
 *   csrf: {
 *     endpoint: '/csrf/token',
 *     enabled: true,
 *   },
 *   axios: {
 *     baseURL: '/api',
 *     timeout: 30000,
 *   }
 * })
 * ```
 */

/**
 * CSRF configuration options
 */
export interface CsrfConfig {
  /**
   * The endpoint to fetch CSRF tokens from
   * @default '/csrf/token'
   */
  endpoint: string;

  /**
   * Whether CSRF protection is enabled
   * @default true
   */
  enabled: boolean;

  /**
   * The header name to send the CSRF token in
   * @default 'x-csrf-token'
   */
  headerName: string;
}

/**
 * Axios configuration options
 */
export interface AxiosConfig {
  /**
   * Base URL for all API requests
   * @default '/api'
   */
  baseURL: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout: number;

  /**
   * Whether to send cookies with requests
   * @default true
   */
  withCredentials: boolean;

  /**
   * Default headers to include in all requests
   */
  headers?: Record<string, string>;
}

/**
 * Authentication configuration options
 */
export interface AuthConfig {
  /**
   * The header name for the authorization token
   * @default 'Authorization'
   */
  tokenHeaderName: string;

  /**
   * The prefix for the authorization token
   * @default 'Bearer'
   */
  tokenPrefix: string;

  /**
   * Endpoint for session recovery from httpOnly cookie
   * @default '/auth/token'
   */
  tokenEndpoint: string;

  /**
   * Endpoint for token refresh
   * @default '/auth/refresh'
   */
  refreshEndpoint: string;

  /**
   * Whether automatic session recovery is enabled
   * @default true
   */
  sessionRecoveryEnabled: boolean;
}

/**
 * Complete quantum-ui configuration interface
 */
export interface QuantumUIConfig {
  /**
   * CSRF token configuration
   */
  csrf?: Partial<CsrfConfig>;

  /**
   * Axios HTTP client configuration
   */
  axios?: Partial<AxiosConfig>;

  /**
   * Authentication configuration
   */
  auth?: Partial<AuthConfig>;
}

/**
 * Default configuration values
 */
const defaultConfig: Required<{
  csrf: CsrfConfig;
  axios: AxiosConfig;
  auth: AuthConfig;
}> = {
  csrf: {
    endpoint: '/csrf/token',
    enabled: true,
    headerName: 'x-csrf-token',
  },
  axios: {
    baseURL: '/api',
    timeout: 30000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },
  auth: {
    tokenHeaderName: 'Authorization',
    tokenPrefix: 'Bearer',
    tokenEndpoint: '/auth/token',
    refreshEndpoint: '/auth/refresh',
    sessionRecoveryEnabled: true,
  },
};

/**
 * Current active configuration
 */
let currentConfig = { ...defaultConfig };

/**
 * Helper function to define configuration with type safety
 * Similar to Tailwind's defineConfig()
 *
 * @param config - User configuration object
 * @returns The same configuration object (for type inference)
 *
 * @example
 * ```typescript
 * export default defineConfig({
 *   csrf: { endpoint: '/api/csrf' }
 * })
 * ```
 */
export function defineConfig(config: QuantumUIConfig): QuantumUIConfig {
  return config;
}

/**
 * Configure quantum-ui with user settings
 * This should be called once in your application's entry point
 *
 * @param userConfig - User configuration object
 *
 * @example
 * ```typescript
 * import config from './quantum-ui.config'
 * import { configureQuantumUI } from '@vritti/quantum-ui'
 *
 * configureQuantumUI(config)
 * ```
 */
export function configureQuantumUI(userConfig: QuantumUIConfig): void {
  currentConfig = {
    csrf: {
      ...defaultConfig.csrf,
      ...(userConfig.csrf || {}),
    },
    axios: {
      ...defaultConfig.axios,
      ...(userConfig.axios || {}),
      headers: {
        ...defaultConfig.axios.headers,
        ...(userConfig.axios?.headers || {}),
      },
    },
    auth: {
      ...defaultConfig.auth,
      ...(userConfig.auth || {}),
    },
  };
}

/**
 * Get the current configuration
 * @returns Current merged configuration
 */
export function getConfig(): typeof currentConfig {
  return currentConfig;
}

/**
 * Reset configuration to defaults
 * Mainly useful for testing
 */
export function resetConfig(): void {
  currentConfig = { ...defaultConfig };
}
