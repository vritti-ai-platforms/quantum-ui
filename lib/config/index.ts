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
   * @default 'cloud-api/auth/token'
   */
  tokenEndpoint: string;

  /**
   * Endpoint for token refresh
   * @default 'cloud-api/auth/refresh'
   */
  refreshEndpoint: string;

  /**
   * Whether automatic session recovery is enabled
   * @default true
   */
  sessionRecoveryEnabled: boolean;
}

/**
 * Views management configuration
 */
export interface ViewsConfig {
  /**
   * Endpoint for named view CRUD operations
   * @default 'table-views'
   */
  viewsEndpoint?: string;

  /**
   * Endpoint for live state upsert
   * @default 'table-states'
   */
  statesEndpoint?: string;
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

  /**
   * Table views management configuration
   */
  views?: ViewsConfig;
}

/**
 * Default configuration values
 */
const defaultConfig: Required<{
  csrf: CsrfConfig;
  axios: AxiosConfig;
  auth: AuthConfig;
  views: Required<ViewsConfig>;
}> = {
  csrf: {
    endpoint: 'csrf/token',
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
    tokenEndpoint: 'cloud-api/auth/token',
    refreshEndpoint: 'cloud-api/auth/refresh',
    sessionRecoveryEnabled: true,
  },
  views: {
    viewsEndpoint: 'table-views',
    statesEndpoint: 'table-states',
  },
};

/**
 * Global key for storing config in window object
 * This ensures config is shared across Module Federation boundaries
 */
const GLOBAL_CONFIG_KEY = '__QUANTUM_UI_CONFIG__';

// Type-safe global window access
type GlobalWindow = Window & typeof globalThis & { [GLOBAL_CONFIG_KEY]?: typeof defaultConfig };

/**
 * Get the current config from global storage or initialize with defaults
 */
function getGlobalConfig(): typeof defaultConfig {
  if (typeof window !== 'undefined') {
    const globalWindow = window as GlobalWindow;
    if (!globalWindow[GLOBAL_CONFIG_KEY]) {
      globalWindow[GLOBAL_CONFIG_KEY] = { ...defaultConfig };
    }
    return globalWindow[GLOBAL_CONFIG_KEY] ?? { ...defaultConfig };
  }
  return { ...defaultConfig };
}

/**
 * Set the global config
 */
function setGlobalConfig(config: typeof defaultConfig): void {
  if (typeof window !== 'undefined') {
    (window as GlobalWindow)[GLOBAL_CONFIG_KEY] = config;
  }
}

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
  const newConfig = {
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
    views: {
      ...defaultConfig.views,
      ...(userConfig.views || {}),
    },
  };
  setGlobalConfig(newConfig);
}

/**
 * Get the current configuration
 * @returns Current merged configuration
 */
export function getConfig(): typeof defaultConfig {
  return getGlobalConfig();
}

/**
 * Reset configuration to defaults
 * Mainly useful for testing
 */
export function resetConfig(): void {
  setGlobalConfig({ ...defaultConfig });
}
