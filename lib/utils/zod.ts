import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Re-export the full zod API + the @hookform/resolvers/zod adapter so apps consume
// validation libs through quantum-ui (single bundled copy, version-locked here).
export * from 'zod';
export { zodResolver };

export interface NumericFieldOptions {
  required?: string;
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
// positive/min/max constraints show their own messages.
export function zodNumericField(options: NumericFieldOptions = {}) {
  const {
    required = 'Required',
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
