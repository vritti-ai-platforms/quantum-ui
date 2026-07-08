export interface CsrfConfig {
  endpoint: string;

  enabled: boolean;

  headerName: string;
}

export interface AxiosConfig {
  baseURL: string;

  timeout: number;

  withCredentials: boolean;

  headers?: Record<string, string>;

  onRequest?: (config: import('axios').InternalAxiosRequestConfig) => void | Promise<void>;
}

export interface AuthConfig {
  tokenHeaderName: string;

  tokenPrefix: string;

  tokenEndpoint: string;

  refreshEndpoint: string;

  sessionRecoveryEnabled: boolean;
}

export interface ViewsConfig {
  viewsEndpoint: string;

  statesEndpoint: string;
}

export interface TimeZoneConfig {
  resolveTimeZone?: () => string | null | undefined;
}

export interface CurrencyConfig {
  resolveCurrency?: () => string | null | undefined;
}

export interface QuantumUIConfig {
  csrf?: Partial<CsrfConfig>;

  axios?: Partial<AxiosConfig>;

  auth?: Partial<AuthConfig>;

  timeZone?: TimeZoneConfig;

  currency?: CurrencyConfig;

  views: ViewsConfig;
}

const defaultConfig: {
  csrf: CsrfConfig;
  axios: AxiosConfig;
  auth: AuthConfig;
  views: Required<ViewsConfig>;
  timeZone: TimeZoneConfig;
  currency: CurrencyConfig;
} = {
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
    tokenEndpoint: 'auth/access-token',
    refreshEndpoint: 'auth/refresh-tokens',
    sessionRecoveryEnabled: true,
  },
  timeZone: {
    resolveTimeZone: undefined,
  },
  currency: {
    resolveCurrency: undefined,
  },
  views: {
    viewsEndpoint: 'table-views',
    statesEndpoint: 'table-states',
  },
};

const GLOBAL_CONFIG_KEY = '__QUANTUM_UI_CONFIG__';

type GlobalWindow = Window & typeof globalThis & { [GLOBAL_CONFIG_KEY]?: typeof defaultConfig };

// Get the current config from global storage or initialize with defaults
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

// Set the global config
function setGlobalConfig(config: typeof defaultConfig): void {
  if (typeof window !== 'undefined') {
    (window as GlobalWindow)[GLOBAL_CONFIG_KEY] = config;
  }
}

// Helper function to define configuration with type safety.
export function defineConfig(config: QuantumUIConfig): QuantumUIConfig {
  return config;
}

// Configure quantum-ui with user settings; call once in the application entry point.
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
    timeZone: {
      ...defaultConfig.timeZone,
      ...(userConfig.timeZone || {}),
    },
    currency: {
      ...defaultConfig.currency,
      ...(userConfig.currency || {}),
    },
    views: {
      ...defaultConfig.views,
      ...(userConfig.views || {}),
    },
  };
  setGlobalConfig(newConfig);
}

// Get the current configuration.
export function getConfig(): typeof defaultConfig {
  return getGlobalConfig();
}

// Reset configuration to defaults; mainly useful for testing.
export function resetConfig(): void {
  setGlobalConfig({ ...defaultConfig });
}
