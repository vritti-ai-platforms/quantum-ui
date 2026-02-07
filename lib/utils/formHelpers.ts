import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * Field mapping configuration for API error to form field mapping
 */
export interface FieldMapping {
  [apiField: string]: string; // Maps API field names to form field names
}

/**
 * Axios error structure (or similar HTTP client error structure)
 */
interface AxiosLikeError {
  response?: {
    data?: unknown;
  };
}

/**
 * RFC 9457 field error structure
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * API error structure with field-specific errors
 * Supports RFC 9457 Problem Details format
 */
export interface ApiErrorResponse {
  type?: string;       // RFC 9457: URI reference identifying the problem type
  title?: string;      // RFC 9457: Short human-readable summary
  status?: number;     // RFC 9457: HTTP status code
  label?: string;      // Root error heading displayed to the user
  detail?: string;     // RFC 9457: Human-readable explanation
  instance?: string;   // RFC 9457: URI reference for the specific occurrence
  errors?: FieldError[];
}

/**
 * Options for mapping API errors to form
 */
export interface MapApiErrorsOptions {
  /**
   * Field name mapping from API to form fields
   */
  fieldMapping?: FieldMapping;

  /**
   * Whether to set root error for general messages
   */
  setRootError?: boolean;
}

/**
 * Maps an RFC 9457 Problem Details API error response to react-hook-form errors.
 *
 * Root errors (`label`/`title` + `detail`) and field errors (`errors[]`) are
 * handled independently -- a single response can populate both the root error
 * alert and inline field errors at the same time.
 *
 * @param error - The error object from API response
 * @param form - The react-hook-form instance
 * @param options - Mapping options
 *
 * @example
 * ```tsx
 * try {
 *   await api.post('/login', data);
 * } catch (error) {
 *   mapApiErrorsToForm(error.response?.data, form, {
 *     fieldMapping: {
 *       'email_address': 'email',
 *       'password_hash': 'password'
 *     }
 *   });
 * }
 * ```
 */
export function mapApiErrorsToForm<TFieldValues extends FieldValues = FieldValues>(
  error: unknown,
  form: UseFormReturn<TFieldValues>,
  options: MapApiErrorsOptions = {},
): void {
  const { fieldMapping = {}, setRootError = true } = options;

  if (!error || typeof error !== 'object') {
    if (setRootError) {
      form.setError('root', {
        type: 'Error',
        message: 'An error occurred',
      });
    }
    return;
  }

  // Extract error data from axios response structure
  const axiosError = error as AxiosLikeError;
  const errorData = axiosError.response?.data || error;
  const apiError = errorData as ApiErrorResponse;

  // Extract title/label for error heading (RFC 9457)
  const errorTitle = apiError.label || apiError.title || 'Error';
  const generalMessage = apiError.detail;

  // Map field-specific errors (field is always present in RFC 9457)
  if (apiError.errors && Array.isArray(apiError.errors)) {
    for (const errorItem of apiError.errors) {
      const formField = fieldMapping[errorItem.field] || errorItem.field;

      form.setError(formField as FieldPath<TFieldValues>, {
        type: 'manual',
        message: errorItem.message,
      });
    }
  }

  // Root error from detail (independent of field errors)
  if (generalMessage && setRootError) {
    form.setError('root', {
      type: errorTitle,
      message: generalMessage,
    });
  }
}
