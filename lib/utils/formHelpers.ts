import type { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * Field mapping configuration for API error to form field mapping
 */
export interface FieldMapping {
  [apiField: string]: string; // Maps API field names to form field names
}

/**
 * RFC 7807 field error structure
 */
export interface FieldError {
  field?: string;
  message: string;
}

/**
 * API error structure with field-specific errors
 * Supports RFC 7807 array format only
 */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: FieldError[]; // RFC 7807 array format only
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
 * Maps API error response to react-hook-form errors
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
        type: 'manual',
        message: 'An error occurred',
      });
    }
    return;
  }

  // Extract error data from axios response structure
  const errorData = (error as any)?.response?.data || error;
  const apiError = errorData as ApiErrorResponse;

  // Handle general error message
  const generalMessage = apiError.message || apiError.error;

  // Map field-specific errors
  let hasFieldErrors = false;

  // Handle RFC 7807 array format: errors: [{field, message}]
  if (apiError.errors && Array.isArray(apiError.errors)) {
    for (const errorItem of apiError.errors) {
      if (errorItem.field) {
        const formField = fieldMapping[errorItem.field] || errorItem.field;

        form.setError(formField as any, {
          type: 'manual',
          message: errorItem.message,
        });
        hasFieldErrors = true;
      } else if (errorItem.message && setRootError) {
        // Error without field goes to root
        form.setError('root', {
          type: 'manual',
          message: errorItem.message,
        });
      }
    }
  }

  // Set root error if no field errors were set but we have a general message
  if (!hasFieldErrors && generalMessage && setRootError) {
    form.setError('root', {
      type: 'manual',
      message: generalMessage,
    });
  }
}
