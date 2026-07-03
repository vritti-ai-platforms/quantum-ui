import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { z } from 'zod';

// Re-export the full zod API + the @hookform/resolvers/zod adapter so apps consume
// validation libs through quantum-ui (single bundled copy, version-locked here).
export * from 'zod';
export { zodResolver };

export interface NumericFieldOptions {
  required?: string;
  nullable?: boolean;
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

// NaN-aware numeric field builder. NaN (empty input) shows required message,
// or becomes null when nullable:true. integer/positive/min/max constraints
// show their own messages and are never silently swallowed.
//
// Semantics (mirrors TextField):
//   - `positive: true`              → value must be > 0 (zero is rejected)
//   - `positive: true` + `integer`  → value must be ≥ 1
//   - `nonZero: true`               → value must be ≠ 0 (use for signed-but-not-zero cases;
//                                     redundant when `positive: true` is also set)
//   - `integer: true`               → value must be a whole number
//
// Overloads narrow the inferred output type: `nullable: true` → `number | null`,
// anything else → `number`. Without these overloads, TS widens the return type
// across both internal branches, so every caller would see `number | null`
// regardless of how they configured `nullable`.
export function zodNumericField(
  options?: Omit<NumericFieldOptions, 'nullable'> & { nullable?: false },
): z.ZodType<number, number>;
export function zodNumericField(
  options: Omit<NumericFieldOptions, 'nullable'> & { nullable: true },
): z.ZodType<number | null, number | null>;
export function zodNumericField(
  options: NumericFieldOptions = {},
): z.ZodType<number, number> | z.ZodType<number | null, number | null> {
  const {
    required = 'Required',
    nullable = false,
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

  if (nullable) {
    return z
      .union([z.number(), z.nan(), z.null()])
      .transform((v) => (v === null || Number.isNaN(v as number) ? null : v))
      .pipe(
        z
          .number()
          .nullable()
          .superRefine((v, ctx) => {
            if (v === null) return;
            if (integer && !Number.isInteger(v)) {
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
          }),
      );
  }

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
  positive?: boolean;
  positiveMessage?: string;
}

// CurrencyField returns undefined when empty and { currency, value } when filled.
// Accept undefined explicitly so the required message fires instead of a generic
// Zod type error from z.object({...}).
export function zodCurrencyField(options: CurrencyFieldOptions = {}) {
  const { required = 'Required', positive = true, positiveMessage = 'Must be greater than 0' } = options;

  return z.union([z.object({ currency: z.string(), value: z.string() }), z.undefined()]).superRefine((v, ctx) => {
    if (!v?.value) {
      ctx.addIssue({ code: 'custom', message: required });
    } else if (positive && Number(v.value) <= 0) {
      ctx.addIssue({ code: 'custom', message: positiveMessage });
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
export function zodPhoneField(options?: { required?: string; optional?: false }): z.ZodType<string, string>;
export function zodPhoneField(options: {
  required?: string;
  optional: true;
}): z.ZodType<string | undefined, string | undefined>;
export function zodPhoneField(
  options: PhoneFieldOptions = {},
): z.ZodType<string, string> | z.ZodType<string | undefined, string | undefined> {
  const { required = 'Required', optional = false } = options;

  if (optional) {
    return z.union([z.string(), z.undefined()]).superRefine((v, ctx) => {
      if (v && !isValidPhoneNumber(v)) {
        ctx.addIssue({ code: 'custom', message: 'Invalid phone number' });
      }
    });
  }

  return z.string({ error: required }).refine((v) => isValidPhoneNumber(v), 'Invalid phone number');
}
