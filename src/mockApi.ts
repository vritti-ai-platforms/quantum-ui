/**
 * Mock API service for testing SingleSelect with API integration
 * Simulates real API behavior with delays, pagination, search, and filtering
 */

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { mockCountries, mockDepartments, mockUsers } from './mockData';

interface ApiParams {
  limit?: number;
  offset?: number;
  dbLabelProps?: {
    labelKey: string;
    subLabelKey?: string;
    search?: string;
    useLabelStartCase?: boolean;
    useSubLabelStartCase?: boolean;
  };
  dbValueProps?: {
    valueKey: string;
    isObjectId?: boolean;
    isInt?: boolean;
    isFloat?: boolean;
    selectedValueData?: unknown;
    filterBySelectedValues?: boolean;
  };
  // Custom filter params
  role?: string;
  status?: string;
  department?: string;
  [key: string]: unknown;
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Transform raw database objects to Option format
 * Uses dbValueProps and dbLabelProps to map fields to Option interface
 */
function transformToOptions(
  items: any[],
  dbValueProps?: ApiParams['dbValueProps'],
  dbLabelProps?: ApiParams['dbLabelProps'],
) {
  const valueKey = dbValueProps?.valueKey || 'id';
  const labelKey = dbLabelProps?.labelKey || 'name';
  const subLabelKey = dbLabelProps?.subLabelKey;

  return items.map((item) => ({
    label: item[labelKey],
    value: item[valueKey],
    subLabel: subLabelKey ? item[subLabelKey] : undefined,
  }));
}

/**
 * Mock API service methods
 */
export const mockApiService = {
  /**
   * Get users with pagination, search, and filtering
   */
  getUsers: async (params: ApiParams) => {
    await delay(500); // Simulate network latency

    const limit = params.limit || 10;
    const offset = params.offset || 0;
    const search = params.dbLabelProps?.search?.toLowerCase() || '';

    // Filter by search
    let filtered = mockUsers;
    if (search) {
      filtered = mockUsers.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
      );
    }

    // Apply custom filters
    if (params.role) {
      filtered = filtered.filter((u) => u.role === params.role);
    }

    if (params.department) {
      filtered = filtered.filter((u) => u.department === params.department);
    }

    // Filter by selected value (for initial load)
    if (params.dbValueProps?.filterBySelectedValues && params.dbValueProps?.selectedValueData) {
      const selectedId = params.dbValueProps.selectedValueData;
      filtered = mockUsers.filter((u) => u.id === selectedId);
    }

    // Paginate
    const results = filtered.slice(offset, offset + limit);

    // Transform to Option format
    return transformToOptions(results, params.dbValueProps, params.dbLabelProps);
  },

  /**
   * Get departments with pagination and search
   */
  getDepartments: async (params: ApiParams) => {
    await delay(300); // Simulate network latency

    const limit = params.limit || 10;
    const offset = params.offset || 0;
    const search = params.dbLabelProps?.search?.toLowerCase() || '';

    // Filter by search
    let filtered = mockDepartments;
    if (search) {
      filtered = mockDepartments.filter(
        (d) => d.name.toLowerCase().includes(search) || d.description.toLowerCase().includes(search),
      );
    }

    // Filter by selected value (for initial load)
    if (params.dbValueProps?.filterBySelectedValues && params.dbValueProps?.selectedValueData) {
      const selectedId = params.dbValueProps.selectedValueData;
      filtered = mockDepartments.filter((d) => d.id === selectedId);
    }

    // Paginate
    const results = filtered.slice(offset, offset + limit);

    // Transform to Option format
    return transformToOptions(results, params.dbValueProps, params.dbLabelProps);
  },

  /**
   * Get countries with pagination and search
   */
  getCountries: async (params: ApiParams) => {
    await delay(400); // Simulate network latency

    const limit = params.limit || 10;
    const offset = params.offset || 0;
    const search = params.dbLabelProps?.search?.toLowerCase() || '';

    // Filter by search
    let filtered = mockCountries;
    if (search) {
      filtered = mockCountries.filter(
        (c) => c.name.toLowerCase().includes(search) || c.continent.toLowerCase().includes(search),
      );
    }

    // Filter by selected value (for initial load)
    if (params.dbValueProps?.filterBySelectedValues && params.dbValueProps?.selectedValueData) {
      const selectedId = params.dbValueProps.selectedValueData;
      filtered = mockCountries.filter((c) => c.id === selectedId);
    }

    // Paginate
    const results = filtered.slice(offset, offset + limit);

    // Transform to Option format
    return transformToOptions(results, params.dbValueProps, params.dbLabelProps);
  },
};

/**
 * Create a mock axios instance with custom adapter
 */
export const createMockAxios = (): AxiosInstance => {
  const mockAxios = axios.create();

  // Override the adapter to intercept all requests
  mockAxios.defaults.adapter = async (config: AxiosRequestConfig) => {
    const url = config.url || '';
    const params = config.params || {};

    console.log('[MockAPI] Request:', url, params);

    try {
      let data: unknown;

      // Route to appropriate mock service based on URL
      if (url.includes('/api/users') || url.includes('/users')) {
        data = await mockApiService.getUsers(params);
      } else if (url.includes('/api/departments') || url.includes('/departments')) {
        data = await mockApiService.getDepartments(params);
      } else if (url.includes('/api/countries') || url.includes('/countries')) {
        data = await mockApiService.getCountries(params);
      } else {
        throw new Error(`Mock API: Unknown endpoint ${url}`);
      }

      console.log('[MockAPI] Response:', Array.isArray(data) ? `${data.length} items` : data);

      // Return a properly formatted axios response
      return Promise.resolve({
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    } catch (error) {
      console.error('[MockAPI] Error:', error);
      return Promise.reject({
        response: {
          data: { error: 'Mock API Error' },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config,
        },
        message: error instanceof Error ? error.message : 'Unknown error',
        config,
      });
    }
  };

  return mockAxios;
};
