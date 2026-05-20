import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { z } from 'zod';

// Re-export the full zod API + the @hookform/resolvers/zod adapter so apps consume
// validation libs through quantum-ui (single bundled copy, version-locked here).
export * from 'zod';
export { zodResolver };

export interface NumericFieldOptions {
  required?: string;
  integer?: boolean;
  integerMessage?: string;
  nonZero?: boolean;
  nonZeroMessage?: string;
  positive?: boolean;
  positiveMessage?: string;
  min?: number;
  minMessage?: string;
  max?: number;
  maxMessage?: string;
}

// NaN-aware numeric field builder. NaN (empty input) shows required message;
// integer/positive/min/max constraints show their own messages.
export function zodNumericField(options: NumericFieldOptions = {}) {
  const {
    required = 'Required',
    integer = false,
    integerMessage = 'Must be a whole number',
    nonZero = false,
    nonZeroMessage = 'Must not be zero',
    positive = false,
    positiveMessage = 'Must be greater than 0',
    min,
    minMessage,
    max,
    maxMessage,
  } = options;

  return z.union([z.number(), z.nan()]).superRefine((v, ctx) => {
    if (Number.isNaN(v)) {
      ctx.addIssue({ code: 'custom', message: required });
    } else if (integer && !Number.isInteger(v)) {
      ctx.addIssue({ code: 'custom', message: integerMessage });
    } else if (nonZero && v === 0) {
      ctx.addIssue({ code: 'custom', message: nonZeroMessage });
    } else if (positive && v <= 0) {
      ctx.addIssue({ code: 'custom', message: positiveMessage });
    } else if (min != null && v < min) {
      ctx.addIssue({ code: 'custom', message: minMessage ?? `Must be at least ${min}` });
    } else if (max != null && v > max) {
      ctx.addIssue({ code: 'custom', message: maxMessage ?? `Must be at most ${max}` });
    }
  });
}

export interface CurrencyFieldOptions {
  required?: string;
}

// CurrencyField returns undefined when empty and { currency, value } when filled.
// Accept undefined explicitly so the required message fires instead of a generic
// Zod type error from z.object({...}).
export function zodCurrencyField(options: CurrencyFieldOptions = {}) {
  const { required = 'Required' } = options;

  return z
    .union([z.object({ currency: z.string(), value: z.string() }), z.undefined()])
    .superRefine((v, ctx) => {
      if (!v?.value) {
        ctx.addIssue({ code: 'custom', message: required });
      }
    });
}

export interface PhoneFieldOptions {
  required?: string;
  optional?: boolean;
}

// PhoneField returns a string (E.164) when filled or undefined/empty when empty.
// Validates with react-phone-number-input's isValidPhoneNumber. Pass optional:true
// to allow empty values without triggering the required message.
export function zodPhoneField(options: PhoneFieldOptions = {}) {
  const { required = 'Required', optional = false } = options;
  return z.union([z.string(), z.undefined()]).superRefine((v, ctx) => {
    if (!v) {
      if (!optional) ctx.addIssue({ code: 'custom', message: required });
    } else if (!isValidPhoneNumber(v)) {
      ctx.addIssue({ code: 'custom', message: 'Invalid phone number' });
    }
  });
}
